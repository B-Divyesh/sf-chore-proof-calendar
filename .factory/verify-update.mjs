/* global process, console, URL, Buffer, navigator, caches, document, fetch */
import { chromium } from '@playwright/test';
import { createServer } from 'node:http';
import { readFileSync, statSync, writeFileSync } from 'node:fs';
import { extname, join, normalize } from 'node:path';

const root = 'dist';
const port = 4191;
let updated = false;
const contentTypes = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp'
};

const server = createServer((request, response) => {
  const url = new URL(request.url, `http://127.0.0.1:${port}`);
  if (url.pathname === '/__update') {
    updated = true;
    response.writeHead(204, { 'Cache-Control': 'no-store' });
    response.end();
    return;
  }

  const isRoute = ['/', '/app', '/demo', '/privacy', '/terms'].includes(url.pathname);
  const relative = isRoute ? 'index.html' : normalize(url.pathname).replace(/^\/+/, '');
  const path = join(root, relative);
  try {
    statSync(path);
    let body = readFileSync(path);
    if (relative === 'sw.js' && updated) body = Buffer.from(body.toString().replace('done-here-v10', 'done-here-v10-update-check'));
    response.writeHead(200, {
      'Content-Type': contentTypes[extname(path)] ?? 'application/octet-stream',
      'Cache-Control': relative === 'sw.js' ? 'no-store' : 'no-cache'
    });
    response.end(body);
  } catch {
    response.writeHead(404);
    response.end('Not found');
  }
});

await new Promise((resolve) => server.listen(port, '127.0.0.1', resolve));
const browser = await chromium.launch();
let report;
try {
  const page = await browser.newPage();
  await page.goto(`http://127.0.0.1:${port}/demo`);
  await page.waitForFunction(() => Boolean(navigator.serviceWorker?.controller));
  const before = await page.evaluate(async () => ({
    caches: await caches.keys(),
    chores: document.querySelectorAll('.chore-card').length
  }));
  await page.evaluate(() => fetch('/__update'));
  await page.evaluate(async () => (await navigator.serviceWorker.getRegistration())?.update());
  await page.getByText('A new version is ready.').waitFor();
  const updateActionVisible = await page.getByRole('button', { name: 'Update now' }).isVisible();
  await page.getByRole('button', { name: 'Update now' }).click();
  await page.waitForLoadState('domcontentloaded');
  await page.waitForFunction(async () => (await caches.keys()).includes('done-here-v10-update-check'));
  report = {
    before,
    updateActionVisible,
    after: {
      caches: await page.evaluate(() => caches.keys()),
      chores: await page.locator('.chore-card').count(),
      demoBannerVisible: await page.getByText('Demo — sample data, nothing is saved').isVisible()
    }
  };
} finally {
  await browser.close();
  await new Promise((resolve) => server.close(resolve));
}

writeFileSync('.factory/evidence-repair-8-local/update.json', JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
if (!report.updateActionVisible || report.after.chores !== 4 || !report.after.demoBannerVisible || !report.after.caches.includes('done-here-v10-update-check')) process.exitCode = 1;
