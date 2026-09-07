import type { LessonSection } from "../types";

export const labFiles = ["README.md", "openapi.yaml", "store.mjs", "trace.mjs", "server.mjs", "cli.mjs", "measure.mjs", "lab.test.mjs"];
export const labLinks = labFiles.map((file) => ({ title: `Download ${file}`, url: `/labs/field-notes/${file}` }));
export const setup: LessonSection = {
  id: "run-the-reference-app", number: "02", label: "Local setup", title: "Run the same Field Notes application",
  introduction: "A fresh folder and Node.js 24 are enough; there is no install step or cloud account.",
  paragraphs: [
    "Field Notes is a hypothetical document-publishing service, continuing the document examples in the foundation chapters. A fixed synthetic author buys publication from a simulated wallet; the service queues a receipt and lists documents. This is a teaching fixture, not an employment story, incident report or payment integration.",
    "Use Node.js 24.4.1 or a newer Node 24 release. The built-in SQLite API may emit an experimental warning on that version. Crash exercises use macOS/Linux signals; Windows readers can use WSL. Copy the eight linked files into a new folder, inspect them, then run the commands below. In a repository checkout, the files live in public/labs/field-notes; copy them into .local/field-notes before running anything. Never create databases in the public source folder.",
    "The server binds to 127.0.0.1:4318, rejects browser Origin requests, and accepts a fixed demo author. It does not authenticate callers. Keep it local. Initialization seeds document-7 and document-8 at 500 simulated cents each and a 10000-cent wallet; running init again does not reset money. Choose a fresh database filename to repeat an exercise.",
  ],
  code: { filename: "terminal.sh", source: `# After copying the eight linked files into a new local directory:
node --version
node cli.mjs init ./field-notes.sqlite
node --test lab.test.mjs
node server.mjs ./field-notes.sqlite
# Leave the server running; use a second terminal for curl and worker commands.
# Stop it with Ctrl-C when finished.` },
  links: labLinks,
};
export const nextSteps = [
  { title: "Foundation: HTTP semantics", url: "/chapters/http-as-a-state-machine/" },
  { title: "Foundation: identity and authorization", url: "/chapters/identity-authentication-authorization/" },
  { title: "Foundation: validation at trust boundaries", url: "/chapters/validation-at-trust-boundaries/" },
  { title: "Foundation: layered request handling", url: "/chapters/layered-request-handling/" },
  { title: "Case study 1: idempotent payments", url: "/chapters/idempotent-payment-endpoint/" },
  { title: "Case study 2: reliable background jobs", url: "/chapters/reliable-background-jobs/" },
  { title: "Case study 3: tracing a slow request", url: "/chapters/tracing-a-slow-request/" },
  { title: "Planned topics and remaining curriculum", url: "/roadmap/" },
];
