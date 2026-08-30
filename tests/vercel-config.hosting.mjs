import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const config = JSON.parse(
  await readFile(new URL("../vercel.json", import.meta.url), "utf8"),
);

test("publishes the Vite client build on Vercel", () => {
  assert.equal(config.outputDirectory, "dist/client");
});

test("uses canonical trailing-slash routes backed by generated HTML", () => {
  assert.equal(config.trailingSlash, true);
  assert.equal(config.rewrites, undefined);
});
