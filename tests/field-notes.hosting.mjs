import assert from 'node:assert/strict';
import { readFile, readdir, stat } from 'node:fs/promises';
import { JSDOM } from 'jsdom';
import test from 'node:test';
import { publishedChapters } from '../src/content/chapters.ts';
import { getSeoRoutes, SITE_URL } from '../src/lib/seo.ts';

const root = new URL('../dist/client/', import.meta.url);
const read = (file) => readFile(new URL(file, root), 'utf8');
const files = ['README.md', 'openapi.yaml', 'store.mjs', 'trace.mjs', 'server.mjs', 'cli.mjs', 'measure.mjs', 'lab.test.mjs'];

test('lab download boundary contains only authored fixtures, byte-identical to reviewed source', async () => {
  assert.deepEqual((await readdir(new URL('labs/field-notes/', root))).sort(), files.toSorted());
  for (const file of files) {
    assert.equal(await read(`labs/field-notes/${file}`), await readFile(new URL(`../public/labs/field-notes/${file}`, import.meta.url), 'utf8'));
  }
});

test('all public pages have unique self-canonicals and valid local links, without study-state HTML', async () => {
  const titles = new Set();
  const descriptions = new Set();
  const routes = getSeoRoutes(publishedChapters);
  const docs = new Map();
  for (const route of routes) docs.set(route.path, new JSDOM(await read(route.path === '/' ? 'index.html' : `${route.path.slice(1)}index.html`)).window.document);
  for (const route of routes) {
    const document = docs.get(route.path);
    assert.equal(document.querySelector('link[rel=canonical]').href, SITE_URL + route.path);
    assert.equal(document.querySelectorAll('link[rel=canonical]').length, 1);
    assert.ok(!titles.has(document.title)); titles.add(document.title);
    const description = document.querySelector('meta[name=description]').content;
    assert.ok(!descriptions.has(description)); descriptions.add(description);
    assert.equal(document.querySelectorAll('h1').length, 1);
    assert.equal(document.querySelector('textarea'), null);
    assert.equal(document.querySelector('[role=dialog]'), null);
    for (const link of document.querySelectorAll('a[href]')) {
      const url = new URL(link.getAttribute('href'), SITE_URL + route.path);
      if (url.origin !== SITE_URL) continue;
      const target = docs.get(url.pathname);
      if (target) {
        if (url.hash) assert.ok(target.getElementById(decodeURIComponent(url.hash.slice(1))), url.href);
      } else {
        // Every internal download must exist; no SPA fallback can mask a missing file.
        assert.ok((await stat(new URL(url.pathname.slice(1), root))).isFile(), url.href);
      }
    }
  }
  for (const chapter of publishedChapters.filter((item) => item.number >= 26)) {
    const document = docs.get(`/chapters/${chapter.slug}/`);
    assert.equal(document.querySelector('.lesson-byline a').textContent, 'Rakibul Islam');
    assert.equal(document.querySelector('.lesson-byline a').href, 'https://therakibul.me/');
    const schema = JSON.parse(document.querySelector('#route-structured-data').textContent);
    assert.equal(schema['@type'], 'TechArticle');
    assert.equal(schema.url, SITE_URL + `/chapters/${chapter.slug}/`);
    assert.equal(schema.author.name, 'Rakibul Islam');
    assert.match(document.body.textContent, /Hypothetical case study/);
  }
  const sitemap = await read('sitemap.xml');
  assert.doesNotMatch(sitemap, /notes|login|account|study|labs\//i);
});
