import { DatabaseSync } from 'node:sqlite';
import { randomUUID } from 'node:crypto';

export function openStore(file) {
  const db = new DatabaseSync(file, { timeout: 250 });
  db.exec('PRAGMA foreign_keys=ON; PRAGMA synchronous=FULL;');
  return db;
}

// Callback MUST be synchronous. No await or external side effect belongs here.
export function transaction(db, action) {
  db.exec('BEGIN IMMEDIATE');
  try {
    const result = action();
    db.exec('COMMIT');
    return result;
  } catch (error) {
    db.exec('ROLLBACK');
    throw error;
  }
}

export function initialize(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS wallets (
      owner TEXT PRIMARY KEY, cents INTEGER NOT NULL CHECK(cents >= 0));
    CREATE TABLE IF NOT EXISTS documents (
      id TEXT PRIMARY KEY, owner TEXT NOT NULL, price INTEGER NOT NULL,
      created INTEGER NOT NULL, title TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS payments (
      id TEXT PRIMARY KEY, owner TEXT NOT NULL,
      document_id TEXT NOT NULL UNIQUE REFERENCES documents(id),
      cents INTEGER NOT NULL CHECK(cents > 0));
    CREATE TABLE IF NOT EXISTS requests (
      owner TEXT NOT NULL, key TEXT NOT NULL, fingerprint TEXT NOT NULL,
      status INTEGER NOT NULL, body TEXT NOT NULL, PRIMARY KEY(owner,key));
    CREATE TABLE IF NOT EXISTS jobs (
      id TEXT PRIMARY KEY REFERENCES payments(id),
      state TEXT NOT NULL CHECK(state IN ('ready','running','done','dead')),
      attempts INTEGER NOT NULL DEFAULT 0, available_at INTEGER NOT NULL,
      lease_until INTEGER, token TEXT, error TEXT, replays INTEGER NOT NULL DEFAULT 0);
    CREATE INDEX IF NOT EXISTS jobs_due ON jobs(state,available_at);
    CREATE TABLE IF NOT EXISTS receipts (
      job_id TEXT PRIMARY KEY REFERENCES jobs(id), body TEXT NOT NULL);
  `);
  transaction(db, () => {
    db.prepare('INSERT OR IGNORE INTO wallets VALUES (?,?)').run('author-1', 10000);
    const insert = db.prepare('INSERT OR IGNORE INTO documents VALUES (?,?,?,?,?)');
    insert.run('document-7', 'author-1', 500, 7, 'Packet routing notes');
    insert.run('document-8', 'author-1', 500, 8, 'Transaction notes');
  });
}

const failure = (status, error) => ({ status, body: JSON.stringify({ error }) });
export function pay(db, owner, key, input, { now = Date.now(), afterDebit = () => {} } = {}) {
  if (typeof key !== 'string' || !/^[A-Za-z0-9_-]{1,80}$/.test(key)) return failure(400, 'invalid_key');
  if (!input || typeof input !== 'object' || Array.isArray(input)
      || Object.keys(input).sort().join(',') !== 'amountCents,currency,documentId'
      || typeof input.documentId !== 'string' || input.documentId.length > 80
      || !Number.isSafeInteger(input.amountCents) || input.amountCents <= 0
      || input.currency !== 'USD') return failure(400, 'invalid_command');
  // Canonical, validated command; JSON property order in the request does not matter.
  const fingerprint = JSON.stringify([input.documentId, input.amountCents, input.currency]);
  return transaction(db, () => {
    const prior = db.prepare('SELECT * FROM requests WHERE owner=? AND key=?').get(owner, key);
    if (prior) return prior.fingerprint === fingerprint
      ? { status: prior.status, body: prior.body } : failure(409, 'key_reused_with_different_command');
    const document = db.prepare('SELECT * FROM documents WHERE id=? AND owner=?').get(input.documentId, owner);
    if (!document) return failure(404, 'document_not_found');
    if (document.price !== input.amountCents) return failure(409, 'price_changed');
    if (db.prepare('SELECT id FROM payments WHERE document_id=?').get(document.id)) return failure(409, 'already_paid');
    const debited = db.prepare('UPDATE wallets SET cents=cents-? WHERE owner=? AND cents>=?')
      .run(document.price, owner, document.price);
    if (!debited.changes) return failure(409, 'insufficient_balance');
    afterDebit(); // Test-only injection: exception/process death must leave no partial debit.
    const id = randomUUID();
    const response = { status: 201, body: JSON.stringify({ paymentId: id, documentId: document.id, amountCents: document.price, currency: 'USD', simulated: true }) };
    db.prepare('INSERT INTO payments VALUES (?,?,?,?)').run(id, owner, document.id, document.price);
    db.prepare('INSERT INTO requests VALUES (?,?,?,?,?)').run(owner, key, fingerprint, response.status, response.body);
    db.prepare("INSERT INTO jobs(id,state,available_at) VALUES (?,'ready',?)").run(id, now);
    return response;
  });
}

export const MAX_ATTEMPTS = 3;
export const LEASE_MS = 1000;
export function claim(db, now = Date.now()) {
  return transaction(db, () => {
    // A worker dying on its final attempt must also reach the dead-letter state.
    db.prepare("UPDATE jobs SET state='dead',error='lease_expired',token=NULL WHERE state='running' AND lease_until<=? AND attempts>=?")
      .run(now, MAX_ATTEMPTS);
    const job = db.prepare(`SELECT * FROM jobs WHERE attempts<? AND
      ((state='ready' AND available_at<=?) OR (state='running' AND lease_until<=?))
      ORDER BY available_at,id LIMIT 1`).get(MAX_ATTEMPTS, now, now);
    if (!job) return undefined;
    const token = randomUUID();
    db.prepare("UPDATE jobs SET state='running',attempts=attempts+1,token=?,lease_until=? WHERE id=?")
      .run(token, now + LEASE_MS, job.id);
    return { ...job, token, attempts: job.attempts + 1, lease_until: now + LEASE_MS };
  });
}

// Equal jitter: [cap/2, cap), cap = min(30s, 250ms * 2^(attempt-1)).
export function retryDelay(attempt, random = Math.random) {
  const cap = Math.min(30000, 250 * 2 ** (attempt - 1));
  return Math.floor(cap / 2 + random() * cap / 2);
}

export function failJob(db, job, now, random = Math.random) {
  return db.prepare(`UPDATE jobs SET state=?,available_at=?,error='receipt_unavailable',token=NULL,lease_until=NULL
    WHERE id=? AND state='running' AND token=? AND lease_until>?`)
    .run(job.attempts >= MAX_ATTEMPTS ? 'dead' : 'ready', now + retryDelay(job.attempts, random), job.id, job.token, now).changes;
}

export function deliverReceipt(db, job) {
  // Fake external sink: its effect commits BEFORE the queue acknowledgment.
  // Stable job_id is the sink's idempotency key, even if a lease has expired.
  db.prepare('INSERT OR IGNORE INTO receipts VALUES (?,?)').run(job.id, JSON.stringify({ paymentId: job.id, simulated: true }));
}

export function acknowledge(db, job, now = Date.now()) {
  return db.prepare(`UPDATE jobs SET state='done',token=NULL,lease_until=NULL,error=NULL
    WHERE id=? AND state='running' AND token=? AND lease_until>?`).run(job.id, job.token, now).changes;
}

export function replay(db, id, now = Date.now()) {
  return db.prepare(`UPDATE jobs SET state='ready',attempts=0,available_at=?,lease_until=NULL,token=NULL,replays=replays+1
    WHERE id=? AND state='dead'`).run(now, id).changes;
}

export const LIST_SQL = 'SELECT id,title,created FROM documents WHERE owner=? ORDER BY created DESC LIMIT 20';
export function seedWorkload(db, count = 100000) {
  transaction(db, () => {
    const insert = db.prepare('INSERT OR IGNORE INTO documents VALUES (?,?,?,?,?)');
    for (let i = 0; i < count; i++) insert.run(`fixture-${i}`, `author-${i % 100}`, 500, i + 100, `Field note ${i}`);
  });
}
export function setListIndex(db, enabled) {
  db.exec(enabled ? 'CREATE INDEX IF NOT EXISTS documents_owner_created ON documents(owner,created DESC)' : 'DROP INDEX IF EXISTS documents_owner_created');
  db.exec('ANALYZE');
}
