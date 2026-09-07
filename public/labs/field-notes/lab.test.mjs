import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { fileURLToPath } from 'node:url';
import { openStore, initialize, pay, claim, acknowledge, deliverReceipt, failJob, replay, retryDelay, seedWorkload, setListIndex, LIST_SQL } from './store.mjs';
import { makeServer } from './server.mjs';

const command = { documentId: 'document-7', amountCents: 500, currency: 'USD' };
function fixture(t) {
  const directory = mkdtempSync(join(tmpdir(), 'field-notes-test-'));
  const file = join(directory, 'test.sqlite');
  const db = openStore(file);
  initialize(db);
  t.after(() => { db.close(); rmSync(directory, { recursive: true, force: true }); });
  return { db, file };
}
function count(db, table) { return db.prepare(`SELECT COUNT(*) AS n FROM ${table}`).get().n; }
function child(file, action, arg) {
  return new Promise((resolve, reject) => {
    const process = spawn(globalThis.process.execPath, [fileURLToPath(new URL('./cli.mjs', import.meta.url)), action, file, ...(arg ? [arg] : [])]);
    let output = '';
    let errors = '';
    process.stdout.on('data', (data) => { output += data; });
    process.stderr.on('data', (data) => { errors += data; });
    process.on('error', reject);
    process.on('exit', (code, signal) => resolve({ code, signal, output, errors }));
  });
}

test('same command replays exact response; conflicting key and second key cannot double debit', (t) => {
  const { db } = fixture(t);
  const first = pay(db, 'author-1', 'key', command);
  assert.equal(first.status, 201);
  assert.deepEqual(pay(db, 'author-1', 'key', { currency: 'USD', amountCents: 500, documentId: 'document-7' }), first);
  assert.equal(pay(db, 'author-1', 'key', { ...command, documentId: 'document-8' }).status, 409);
  assert.equal(pay(db, 'author-1', 'other-key', command).status, 409);
  assert.equal(db.prepare('SELECT cents FROM wallets').get().cents, 9500);
  for (const table of ['payments', 'requests', 'jobs']) assert.equal(count(db, table), 1);
});

test('validation and ownership reject before effects; failed transaction can be retried', (t) => {
  const { db } = fixture(t);
  for (const input of [null, [], { ...command, amountCents: 0 }, { ...command, amountCents: 2.5 }, { ...command, currency: 'EUR' }, { ...command, extra: 1 }]) {
    assert.equal(pay(db, 'author-1', 'key', input).status, 400);
  }
  assert.equal(pay(db, 'author-2', 'key', command).status, 404);
  assert.equal(pay(db, 'author-1', 'key', { ...command, amountCents: 1 }).status, 409);
  assert.throws(() => pay(db, 'author-1', 'key', command, { afterDebit: () => { throw new Error('disk failure'); } }));
  assert.equal(db.prepare('SELECT cents FROM wallets').get().cents, 10000);
  assert.equal(count(db, 'payments'), 0);
  assert.equal(count(db, 'jobs'), 0);
  assert.equal(pay(db, 'author-1', 'key', command).status, 201);
});

test('separate processes serialize competing payment requests and persist replay after restart', async (t) => {
  const { db, file } = fixture(t);
  const results = await Promise.all(Array.from({ length: 6 }, () => child(file, 'pay', 'race-key')));
  for (const result of results) assert.equal(result.code, 0, result.errors);
  const replies = results.map((result) => JSON.parse(result.output));
  assert.ok(replies.every((reply) => reply.status === 201 && reply.body === replies[0].body));
  const restarted = await child(file, 'pay', 'race-key');
  assert.deepEqual(JSON.parse(restarted.output), replies[0]);
  assert.equal(db.prepare('SELECT cents FROM wallets').get().cents, 9500);
  assert.equal(count(db, 'payments'), 1);
});

test('process killed inside debit transaction rolls back durable state', async (t) => {
  const { db, file } = fixture(t);
  const result = await child(file, 'crash-debit');
  assert.equal(result.signal, 'SIGKILL');
  assert.equal(db.prepare('SELECT cents FROM wallets').get().cents, 10000);
  for (const table of ['payments', 'requests', 'jobs']) assert.equal(count(db, table), 0);
  assert.equal(pay(db, 'author-1', 'retry', command).status, 201);
});

test('dependency failure backs off, exhausts, and requires explicit replay', (t) => {
  const { db } = fixture(t);
  pay(db, 'author-1', 'key', command, { now: 0 });
  let now = 0;
  let id;
  for (let attempt = 1; attempt <= 3; attempt++) {
    const job = claim(db, now);
    id = job.id;
    assert.equal(job.attempts, attempt);
    assert.equal(failJob(db, job, now, () => 0), 1);
    assert.equal(claim(db, now), undefined);
    now += retryDelay(attempt, () => 0);
  }
  assert.equal(db.prepare('SELECT state FROM jobs').get().state, 'dead');
  assert.equal(count(db, 'receipts'), 0);
  assert.equal(claim(db, now + 100000), undefined);
  assert.equal(replay(db, id, now), 1);
  const job = claim(db, now);
  deliverReceipt(db, job);
  assert.equal(acknowledge(db, job, now), 1);
  assert.equal(replay(db, id, now), 0);
  assert.equal(db.prepare('SELECT replays FROM jobs').get().replays, 1);
});

test('crashed final attempt reaches dead letters; stale token cannot acknowledge or fail a newer lease', (t) => {
  const { db } = fixture(t);
  pay(db, 'author-1', 'key', command, { now: 0 });
  const stale = claim(db, 0);
  assert.equal(claim(db, 999), undefined);
  const current = claim(db, 1000);
  assert.equal(acknowledge(db, stale, 1001), 0);
  assert.equal(failJob(db, stale, 1001), 0);
  assert.notEqual(stale.token, current.token);
  assert.equal(claim(db, 2000).attempts, 3);
  assert.equal(claim(db, 3000), undefined);
  assert.equal(db.prepare('SELECT state FROM jobs').get().state, 'dead');
});

test('real crash after effect redelivers once lease expires without duplicating the receipt', async (t) => {
  const { db, file } = fixture(t);
  pay(db, 'author-1', 'key', command);
  const result = await child(file, 'work', '--crash-after-effect');
  assert.equal(result.signal, 'SIGKILL');
  assert.equal(count(db, 'receipts'), 1);
  const saved = db.prepare('SELECT * FROM jobs').get();
  assert.equal(saved.state, 'running');
  const recovered = claim(db, saved.lease_until);
  deliverReceipt(db, recovered);
  assert.equal(acknowledge(db, recovered, saved.lease_until), 1);
  assert.equal(count(db, 'receipts'), 1);
});

test('competing worker processes only own one live lease', async (t) => {
  const { db, file } = fixture(t);
  pay(db, 'author-1', 'key', command);
  const results = await Promise.all([child(file, 'work'), child(file, 'work')]);
  for (const result of results) assert.equal(result.code, 0, result.errors);
  assert.equal(count(db, 'receipts'), 1);
  assert.equal(db.prepare('SELECT state,attempts FROM jobs').get().state, 'done');
  assert.equal(db.prepare('SELECT attempts FROM jobs').get().attempts, 1);
});

test('jitter stays bounded and exponential growth is capped', () => {
  assert.equal(retryDelay(1, () => 0), 125);
  assert.ok(retryDelay(2, () => 0.999) < 500);
  assert.equal(retryDelay(20, () => 0), 15000);
  assert.ok(retryDelay(20, () => 0.999) < 30000);
});

test('HTTP contract, exact replay, busy dependency and request-scoped database traces', async (t) => {
  const { db, file } = fixture(t);
  seedWorkload(db, 10000);
  const spans = [];
  const server = makeServer(db, (span) => spans.push(span));
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  t.after(async () => { server.closeAllConnections(); await new Promise((resolve) => server.close(resolve)); });
  const url = `http://127.0.0.1:${server.address().port}`;
  const post = (body = JSON.stringify(command), headers = {}) => fetch(url + '/payments', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Idempotency-Key': 'http-key', ...headers }, body });
  const [a, b] = await Promise.all([post(), post()]);
  assert.equal(a.status, 201);
  assert.equal(b.status, 201);
  assert.equal(await a.text(), await b.text());
  assert.equal((await post('{')).status, 400);
  assert.equal((await post('{}', { Origin: 'https://example.com' })).status, 403);
  assert.equal((await post('{}', { 'Content-Type': 'text/plain' })).status, 415);
  assert.equal((await post('x'.repeat(5000))).status, 413);
  const lock = openStore(file);
  lock.exec('BEGIN IMMEDIATE');
  try { assert.equal((await post()).status, 503); }
  finally { lock.exec('ROLLBACK'); lock.close(); }
  assert.equal((await post()).status, 201);
  const responses = await Promise.all([fetch(url + '/documents'), fetch(url + '/documents')]);
  const traceIds = responses.map((response) => response.headers.get('x-trace-id'));
  assert.notEqual(traceIds[0], traceIds[1]);
  for (const traceId of traceIds) {
    const trace = spans.filter((span) => span.traceId === traceId);
    assert.equal(trace.length, 4);
    const root = trace.find((span) => span.parentSpanId === null);
    const service = trace.find((span) => span.name === 'documents.list');
    const query = trace.find((span) => span.name.startsWith('sqlite'));
    assert.equal(service.parentSpanId, root.spanId);
    assert.equal(query.parentSpanId, service.spanId);
    assert.ok(query.durationMs <= service.durationMs);
    assert.ok(service.durationMs <= root.durationMs);
    assert.ok(!JSON.stringify(trace).includes('http-key'));
  }
});

test('index changes the access path without changing ordered API data', (t) => {
  const { db } = fixture(t);
  seedWorkload(db, 10000);
  const before = db.prepare(LIST_SQL).all('author-42');
  const beforePlan = db.prepare('EXPLAIN QUERY PLAN ' + LIST_SQL).all('author-42');
  assert.ok(beforePlan.some((row) => row.detail.includes('SCAN')));
  setListIndex(db, true);
  assert.deepEqual(db.prepare(LIST_SQL).all('author-42'), before);
  const plan = db.prepare('EXPLAIN QUERY PLAN ' + LIST_SQL).all('author-42');
  assert.ok(plan.some((row) => row.detail.includes('documents_owner_created')));
  assert.ok(!plan.some((row) => row.detail.includes('TEMP B-TREE')));
  assert.equal(before.length, 20);
});

test('database failure produces error spans and a 503 rather than a successful empty list', async () => {
  const db = openStore(':memory:');
  initialize(db);
  db.close();
  const spans = [];
  const server = makeServer(db, (span) => spans.push(span));
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  try {
    const response = await fetch(`http://127.0.0.1:${server.address().port}/documents`);
    assert.equal(response.status, 503);
    assert.deepEqual(await response.json(), { error: 'store_unavailable' });
    assert.equal(spans.length, 3);
    assert.ok(spans.every((span) => span.status === 'error'));
  } finally {
    server.closeAllConnections();
    await new Promise((resolve) => server.close(resolve));
  }
});
