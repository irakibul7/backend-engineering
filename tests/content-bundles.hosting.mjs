import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import { gzipSync } from "node:zlib";
import test from "node:test";
import { publishedChapters } from "../src/content/chapters.ts";
const assets = new URL("../dist/client/assets/", import.meta.url);
const client = new URL("../dist/client/", import.meta.url);

test("every direct lesson contains readable static sections and examples", async () => {
  for (const chapter of publishedChapters) {
    const html = await readFile(new URL(`chapters/${chapter.slug}/index.html`,client),"utf8");
    for (const section of chapter.sections) {
      assert.ok(html.includes(`id="${section.id}"`), `${chapter.slug}: ${section.id}`);
      assert.ok(html.includes(section.introduction.replaceAll("&","&amp;").replaceAll('"',"&quot;").replaceAll("'","&#x27;")), section.id);
    }
  }
});
test("shared entry and networking chunks stay within the approved budgets", async () => {
  const names = await readdir(assets);
  const html = await readFile(new URL("index.html",client),"utf8");
  const entryName = html.match(/src="\/assets\/([^" ]+\.js)"/)[1];
  const entry = await readFile(new URL(entryName,assets));
  const loader = names.find(name => name.startsWith("loadLesson-") && name.endsWith(".js"));
  assert.ok(gzipSync(entry).length + gzipSync(await readFile(new URL(loader, assets))).length < 100_000);
  assert.ok(!entry.toString().includes("HTTP works because two programs"));
  for (const chapter of publishedChapters) assert.ok(names.some(name => name.startsWith(chapter.slug+"-") && name.endsWith(".js")), chapter.slug);
  const networking = names.find(name=>name.startsWith("networking-and-packet-routing-") && name.endsWith(".js"));
  const scenario = names.find(name => name.startsWith("scenarios-") && name.endsWith(".js"));
  const lab = names.find(name => name.startsWith("NetworkingLab-") && name.endsWith(".js"));
  const contentSizes = await Promise.all([networking, scenario, lab].map(async name => gzipSync(await readFile(new URL(name, assets))).length));
  assert.ok(contentSizes.reduce((sum, size) => sum + size, 0) < 35_000);
  const scene = names.find(name=>name.startsWith("observatory-") && name.endsWith(".js"));
  assert.ok(gzipSync(await readFile(new URL(scene,assets))).length < 180_000);
});
