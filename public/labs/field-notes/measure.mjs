import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir, platform, release, arch, cpus, totalmem } from 'node:os';
import { join } from 'node:path';
import { performance } from 'node:perf_hooks';
import { once } from 'node:events';
import { createHash } from 'node:crypto';
import { openStore, initialize, seedWorkload, setListIndex, LIST_SQL } from './store.mjs';
import { makeServer } from './server.mjs';

// Fresh disposable database, one API server, one sequential client, fixed workload.
const directory = mkdtempSync(join(tmpdir(), 'field-notes-measure-'));
const db = openStore(join(directory, 'measurement.sqlite'));
const allSpans = [];
const server = makeServer(db, (span) => allSpans.push(span));
try {
  initialize(db);
  seedWorkload(db);
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  const url = `http://127.0.0.1:${server.address().port}/documents?owner=author-42`;
  const runs = [];
  for (const indexed of [false, true]) {
    setListIndex(db, indexed);
    const plan = db.prepare('EXPLAIN QUERY PLAN ' + LIST_SQL).all('author-42');
    const samples = [];
    const digests = new Set();
    for (let i = 0; i < 110; i++) {
      const start = performance.now();
      const response = await fetch(url);
      const body = await response.text();
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const elapsed = performance.now() - start;
      digests.add(createHash('sha256').update(body).digest('hex'));
      if (i >= 10) samples.push({ clientMs: elapsed, traceId: response.headers.get('x-trace-id') });
    }
    const sorted = samples.map((s) => s.clientMs).sort((a, b) => a - b);
    runs.push({ indexed, plan, errors: 0, resultDigests: [...digests], samples, p50Ms: sorted[49], p95Ms: sorted[94] });
  }
  console.log(JSON.stringify({
    recordedAt: new Date().toISOString(),
    environment: { node: process.version, sqlite: db.prepare('SELECT sqlite_version() AS version').get().version,
      os: `${platform()} ${release()} ${arch()}`, cpu: cpus()[0]?.model, logicalCpus: cpus().length, memoryBytes: totalmem() },
    workload: { rows: 100002, authors: 100, owner: 'author-42', resultLimit: 20, concurrency: 1,
      warmupPerVariant: 10, samplesPerVariant: 100, order: 'unindexed then indexed',
      journal: db.prepare('PRAGMA journal_mode').get(), synchronous: db.prepare('PRAGMA synchronous').get(),
      timing: 'warm API fetch through complete response body; same-process client and synchronous database; spans buffered in memory; no network service' },
    runs, spans: allSpans,
  }, null, 2));
} finally {
  server.closeAllConnections();
  await new Promise((resolve) => server.close(resolve));
  db.close();
  rmSync(directory, { recursive: true, force: true });
}
