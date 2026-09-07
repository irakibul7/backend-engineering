import { createServer } from 'node:http';
import { pathToFileURL } from 'node:url';
import { openStore, pay, LIST_SQL } from './store.mjs';
import { createTrace } from './trace.mjs';

export function makeServer(db, emit) {
  const server = createServer(async (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 'no-store');
    const send = (status, body) => { res.writeHead(status); res.end(body); };
    if (req.headers.origin || !/^127\.0\.0\.1(?::\d+)?$/.test(req.headers.host ?? '')) {
      send(403, '{"error":"loopback_cli_only"}'); return;
    }
    const url = new URL(req.url, 'http://127.0.0.1');
    if (req.method === 'POST' && url.pathname === '/payments') {
      if (req.headers['content-type']?.split(';')[0].trim() !== 'application/json') {
        send(415, '{"error":"json_required"}'); return;
      }
      let size = 0;
      const chunks = [];
      try {
        for await (const chunk of req) {
          size += chunk.length;
          if (size > 4096) { send(413, '{"error":"body_too_large"}'); return; }
          chunks.push(chunk);
        }
      } catch { if (!res.destroyed) send(400, '{"error":"incomplete_body"}'); return; }
      let input;
      try { input = JSON.parse(Buffer.concat(chunks).toString('utf8')); }
      catch { send(400, '{"error":"invalid_json"}'); return; }
      try {
        const result = pay(db, 'author-1', req.headers['idempotency-key'], input);
        send(result.status, result.body);
      } catch {
        res.setHeader('Retry-After', '1');
        send(503, '{"error":"store_unavailable_retry_same_key"}');
      }
      return;
    }
    if (req.method === 'GET' && url.pathname === '/documents') {
      const trace = createTrace(emit);
      res.setHeader('X-Trace-Id', trace.traceId);
      try {
        trace.span('http GET /documents', null, (root) => {
          const rows = trace.span('documents.list', root, (service) => trace.span('sqlite SELECT documents', service,
            () => db.prepare(LIST_SQL).all((url.searchParams.get('owner') ?? 'author-42').slice(0, 80))));
          const body = trace.span('json.serialize', root, () => JSON.stringify(rows));
          send(200, body);
        });
      } catch { send(503, '{"error":"store_unavailable"}'); }
      trace.flush(); // Export overhead is outside server spans, inside client-observed work.
      return;
    }
    send(404, '{"error":"not_found"}');
  });
  server.requestTimeout = 5000;
  server.headersTimeout = 5000;
  server.setTimeout(5000, (socket) => socket.destroy());
  return server;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const db = openStore(process.argv[2] ?? './field-notes.sqlite');
  const server = makeServer(db);
  server.listen(4318, '127.0.0.1', () => console.log('Field Notes simulation: http://127.0.0.1:4318'));
  process.on('SIGINT', () => server.close(() => { db.close(); process.exit(0); }));
}
