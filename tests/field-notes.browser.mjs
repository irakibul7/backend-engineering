import { chromium, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import assert from 'node:assert/strict';
import { mkdir, writeFile, mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';

const origin = process.env.BROWSER_BASE_URL ?? 'http://127.0.0.1:4176';
const output = '.local/field-notes-browser';
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ channel: process.env.BROWSER_CHANNEL ?? 'chrome', headless: true });
const report = { browser: browser.version(), viewports: [], journeys: [], errors: [], downloads: 0 };
const slugs = ['idempotent-payment-endpoint', 'reliable-background-jobs', 'tracing-a-slow-request'];
const pages = ['/', '/roadmap/', ...slugs.map((slug) => `/chapters/${slug}/`)];
const privateMarker = 'PRIVATE-STUDY-FIXTURE-ONLY-9284';
const requests = [];

async function scan(page, label) {
  const result = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
  assert.deepEqual(result.violations.map((item) => ({ id: item.id, nodes: item.nodes.map((node) => node.target) })), [], label);
}
try {
  for (const width of [1280, 390, 320]) {
    const context = await browser.newContext({ viewport: { width, height: width === 1280 ? 720 : width === 390 ? 844 : 700 }, reducedMotion: 'reduce', permissions: ['clipboard-read', 'clipboard-write'] });
    const page = await context.newPage();
    page.setDefaultTimeout(10000);
    page.on('console', (message) => { if (['warning', 'error'].includes(message.type())) report.errors.push(message.text()); });
    page.on('pageerror', (error) => report.errors.push(error.message));
    page.on('request', (request) => requests.push({ url: request.url(), body: request.postData() }));
    for (const path of pages) {
      const response = await page.goto(origin + path);
      assert.equal(response.status(), 200);
      await page.locator('h1').waitFor();
      await page.evaluate(() => document.fonts.ready);
      await expect(page.locator('link[rel=canonical]')).toHaveAttribute('href', 'https://backend.therakibul.me' + path);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
      assert.equal(overflow, false, `${width}: ${path}`);
      await scan(page, `${width}: ${path}`);
      await page.screenshot({ path: `${output}/${width}-${path.split('/').filter(Boolean).at(-1) ?? 'catalog'}.png` });
      if (path.includes('/chapters/')) {
        await expect(page.locator('.lesson-byline a')).toHaveText('Rakibul Islam');
        await page.locator('figure').first().scrollIntoViewIfNeeded();
        const diagrams = page.locator('figure');
        for (let i = 0; i < await diagrams.count(); i++) {
          const bounds = await diagrams.nth(i).boundingBox();
          assert.ok(bounds.x >= -1 && bounds.x + bounds.width <= width + 1, 'diagram must reflow');
        }
        if (width < 600) {
          await page.getByRole('button', { name: 'Contents', exact: true }).click();
          await page.locator('.lesson-toc').getByRole('link', { name: /Run the same Field Notes/ }).click();
          await expect(page).toHaveURL(/#run-the-reference-app$/);
          await expect(page.locator('.lesson-toc')).not.toHaveClass(/lesson-toc--open/);
        }
        await page.getByRole('button', { name: 'Copy', exact: true }).first().click();
        assert.ok((await page.evaluate(() => navigator.clipboard.readText())).includes('node'));
      }
    }
    report.viewports.push({ width, pages: pages.length, axeViolations: 0, overflow: false });

    // Search is entirely client-side, keyboard selection reaches the new chapter.
    await page.goto(origin + '/');
    await page.getByRole('button', { name: 'Search chapters and topics' }).click();
    const search = page.getByRole('textbox', { name: 'Search chapters and topics' });
    await expect(search).toBeFocused();
    await search.fill('idempotent payment');
    await scan(page, 'search');
    await search.press('ArrowDown');
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/chapters\/idempotent-payment-endpoint\//);
    await expect(page.locator('h1')).toHaveText('Designing an Idempotent Payment Endpoint');
    const nextLink = page.getByRole('navigation', { name: 'Chapter navigation' }).getByRole('link', { name: /Next.*Reliable Background Jobs/ });
    await nextLink.click();
    await expect(page).toHaveURL(/chapters\/reliable-background-jobs\//);
    await page.goBack();
    await expect(page).toHaveURL(/chapters\/idempotent-payment-endpoint\//);

    // Notes remain local through reload; safe Markdown preview and keyboard exit.
    await page.getByRole('button', { name: /^Open study notes/ }).click();
    const editor = page.getByRole('textbox', { name: 'Study notes Markdown editor' });
    await expect(editor).toBeFocused();
    await editor.fill(`# ${privateMarker}\n\n<script>alert(1)</script>`);
    await page.getByRole('tab', { name: 'Preview', exact: true }).click();
    await expect(page.locator('.note-preview')).toContainText(privateMarker);
    assert.equal(await page.locator('.note-preview script').count(), 0);
    await scan(page, 'notes-preview');
    await page.keyboard.press('Escape');
    await expect(page.getByRole('button', { name: /^Open study notes/ })).toBeFocused();
    await page.reload();
    await page.getByRole('button', { name: /^Open study notes/ }).click();
    await expect(page.getByRole('textbox', { name: 'Study notes Markdown editor' })).toHaveValue(new RegExp(privateMarker));
    await page.keyboard.press('Escape');
    // Three theme states remain accessible and persist.
    for (let i = 0; i < 3; i++) {
      await page.getByRole('button', { name: 'Switch color theme' }).click();
      await page.evaluate(() => window.scrollTo(0, 0));
      await scan(page, `theme-${i}`);
    }
    await context.close();
    report.journeys.push({ width, searchKeyboard: true, chapterNavigation: true, notesPrivate: true, themes: true, copy: true });
  }
  const noJs = await browser.newContext({ javaScriptEnabled: false });
  const page = await noJs.newPage();
  for (const slug of slugs) {
    await page.goto(`${origin}/chapters/${slug}/`);
    assert.equal(await page.locator('.lesson-section').count(), 9);
    await expect(page.locator('main')).toContainText('node --test lab.test.mjs');
    assert.equal(await page.locator('figure:not(.code-block)').count(), 2);
  }
  await noJs.close();
  report.journeys.push({ noJavaScript: true });

  // Fetch the published artifacts and execute them as a standalone download.
  const directory = await mkdtemp(join(tmpdir(), 'field-notes-download-'));
  try {
    for (const file of ['README.md', 'openapi.yaml', 'store.mjs', 'trace.mjs', 'server.mjs', 'cli.mjs', 'measure.mjs', 'lab.test.mjs']) {
      const response = await fetch(`${origin}/labs/field-notes/${file}`);
      assert.equal(response.status, 200);
      await writeFile(join(directory, file), await response.text());
      report.downloads++;
    }
    execFileSync(process.execPath, ['--test', 'lab.test.mjs'], { cwd: directory, stdio: 'pipe' });
  } finally { await rm(directory, { recursive: true, force: true }); }
  assert.equal(requests.some((request) => JSON.stringify(request).includes(privateMarker)), false);
  assert.ok(requests.every((request) => new URL(request.url).origin === origin), 'local preview must not send telemetry or load remote assets');
  assert.deepEqual(report.errors, []);
  await writeFile(`${output}/report.json`, JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
} finally { await browser.close(); }
