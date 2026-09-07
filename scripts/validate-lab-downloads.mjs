import assert from 'node:assert/strict';
import { readdirSync, lstatSync } from 'node:fs';

const directory = new URL('../public/labs/field-notes/', import.meta.url);
const allowed = ['README.md', 'openapi.yaml', 'store.mjs', 'trace.mjs', 'server.mjs', 'cli.mjs', 'measure.mjs', 'lab.test.mjs'];
assert.deepEqual(readdirSync(directory).sort(), allowed.toSorted(), 'Only the reviewed Field Notes source allowlist may be built. Move generated state outside public/.');
for (const file of allowed) assert.ok(lstatSync(new URL(file, directory)).isFile(), `Expected a regular authored file: ${file}`);
console.log('Validated eight authored lab downloads; no generated state or symlinks.');
