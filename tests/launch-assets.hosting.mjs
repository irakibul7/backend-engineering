import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";
import test from "node:test";

const clientUrl = new URL("../dist/client/", import.meta.url);

async function read(relativePath, encoding = "utf8") {
  return readFile(new URL(relativePath, clientUrl), encoding);
}

function pngDimensions(buffer) {
  assert.equal(buffer.toString("ascii", 1, 4), "PNG");
  return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
}

test("emits favicon, app icons, manifest, and the social-sharing cover", async () => {
  const manifest = JSON.parse(await read("manifest.webmanifest"));
  const icon192 = await read("icon-192.png", null);
  const icon512 = await read("icon-512.png", null);
  const socialCover = await read("social-cover.png", null);

  assert.equal(manifest.name, "Backend Engineering");
  assert.deepEqual(pngDimensions(icon192), { width: 192, height: 192 });
  assert.deepEqual(pngDimensions(icon512), { width: 512, height: 512 });
  assert.deepEqual(pngDimensions(socialCover), { width: 1200, height: 630 });
  await stat(new URL("favicon.svg", clientUrl));
  await stat(new URL("favicon.ico", clientUrl));
  await stat(new URL("apple-touch-icon.png", clientUrl));
  await stat(new URL("apple-touch-icon-precomposed.png", clientUrl));
  const home = await read("index.html");
  assert.match(home, /favicon\.svg\?v=2/);
  assert.match(home, /favicon\.ico\?v=2/);
  assert.match(home, /manifest\.webmanifest\?v=2/);
});

test("emits route-specific canonical, Open Graph, Twitter, and structured metadata", async () => {
  const home = await read("index.html");
  const roadmap = await read("roadmap/index.html");
  const lesson = await read("chapters/routing-and-request-dispatch/index.html");

  assert.match(home, /<link rel="canonical" href="https:\/\/backend\.therakibul\.me\/"/);
  assert.match(roadmap, /<title>Backend Engineering Roadmap — Rakibul Islam<\/title>/);
  assert.match(lesson, /<meta property="og:type" content="article"/);
  assert.match(lesson, /<meta name="twitter:card" content="summary_large_image"/);
  assert.match(lesson, /https:\/\/backend\.therakibul\.me\/chapters\/routing-and-request-dispatch\//);
  assert.match(lesson, /"@type":"TechArticle"/);
});

test("sitemap contains only canonical public routes", async () => {
  const sitemap = await read("sitemap.xml");
  const locations = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => match[1]);

  assert.deepEqual(locations, [
    "https://backend.therakibul.me/",
    "https://backend.therakibul.me/roadmap/",
    "https://backend.therakibul.me/chapters/http-as-a-state-machine/",
    "https://backend.therakibul.me/chapters/routing-and-request-dispatch/",
  ]);
  assert.doesNotMatch(sitemap, /representation-and-serialization|localhost|vercel\.app/);
});

test("robots allows crawling and advertises the canonical sitemap", async () => {
  const robots = await read("robots.txt");
  assert.match(robots, /^User-agent: \*$/m);
  assert.match(robots, /^Allow: \/$/m);
  assert.match(robots, /^Sitemap: https:\/\/backend\.therakibul\.me\/sitemap\.xml$/m);
});

test("ships Vercel Analytics and Speed Insights instrumentation", async () => {
  const packageJson = JSON.parse(await readFile(new URL("../package.json", import.meta.url), "utf8"));
  assert.equal(packageJson.dependencies["@vercel/analytics"], "2.0.1");
  assert.equal(packageJson.dependencies["@vercel/speed-insights"], "2.0.0");
});
