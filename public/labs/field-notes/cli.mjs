import { openStore, initialize, seedWorkload, setListIndex, claim, failJob, deliverReceipt, acknowledge, replay, pay, LIST_SQL } from './store.mjs';

const [command, file = './field-notes.sqlite', argument] = process.argv.slice(2);
if (!['init', 'seed', 'index', 'plan', 'work', 'jobs', 'replay', 'pay', 'crash-debit'].includes(command)) {
  throw new Error('Usage: node cli.mjs init|seed|index|plan|work|jobs|replay|pay|crash-debit DATABASE [argument]');
}
const db = openStore(file);
try {
  if (command === 'init') { initialize(db); console.log('Initialized synthetic documents and wallet (10000 cents).'); }
  if (command === 'seed') { seedWorkload(db); console.log('Seeded 100000 synthetic documents.'); }
  if (command === 'index') { setListIndex(db, argument !== 'off'); console.log('Index ' + (argument === 'off' ? 'off' : 'on')); }
  if (command === 'plan') console.log(JSON.stringify(db.prepare('EXPLAIN QUERY PLAN ' + LIST_SQL).all('author-42')));
  if (command === 'jobs') console.log(JSON.stringify(db.prepare('SELECT id,state,attempts,error,replays FROM jobs ORDER BY id').all()));
  if (command === 'replay') console.log(JSON.stringify({ replayed: replay(db, argument) }));
  if (command === 'pay' || command === 'crash-debit') {
    console.log(JSON.stringify(pay(db, 'author-1', argument ?? 'demo-key', { documentId: 'document-7', amountCents: 500, currency: 'USD' }, {
      afterDebit: () => { if (command === 'crash-debit') process.kill(process.pid, 'SIGKILL'); },
    })));
  }
  if (command === 'work') {
    const job = claim(db);
    if (!job) console.log('{"state":"idle"}');
    else if (argument === '--unavailable') {
      failJob(db, job, Date.now());
      console.log(JSON.stringify({ jobId: job.id, attempt: job.attempts, dependency: 'unavailable' }));
    } else {
      deliverReceipt(db, job);
      if (argument === '--crash-after-effect') process.kill(process.pid, 'SIGKILL');
      console.log(JSON.stringify({ jobId: job.id, acknowledged: acknowledge(db, job) === 1 }));
    }
  }
} finally { db.close(); }
