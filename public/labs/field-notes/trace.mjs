import { randomBytes } from 'node:crypto';
import { performance } from 'node:perf_hooks';

export function createTrace(emit = (span) => console.log(JSON.stringify(span))) {
  const traceId = randomBytes(16).toString('hex');
  const spans = [];
  function span(name, parentSpanId, action) {
    const spanId = randomBytes(8).toString('hex');
    const start = performance.now();
    let status = 'ok';
    try { return action(spanId); }
    catch (error) { status = 'error'; throw error; }
    finally {
      spans.push({ traceId, spanId, parentSpanId, name, status, startMs: start, durationMs: performance.now() - start });
    }
  }
  return { traceId, spans, span, flush: () => spans.forEach(emit) };
}
