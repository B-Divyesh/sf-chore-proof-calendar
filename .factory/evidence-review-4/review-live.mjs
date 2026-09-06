/* global indexedDB, localStorage, sessionStorage, document, getComputedStyle */
import { chromium } from '@playwright/test';
import { writeFileSync } from 'node:fs';

const base = 'https://chore-proof-calendar.sociobot.in';
const out = '.factory/evidence-review-4';
const browser = await chromium.launch();
const report = { coldRead: [], demo: {}, isolation: {}, links: {}, errors: [] };
const assert = (condition, message) => { if (!condition) throw new Error(message); };

async function databaseRows(page) {
  return page.evaluate(async () => new Promise((resolve, reject) => {
    const open = indexedDB.open('done-here:v1', 1);
    open.onerror = () => reject(open.error);
    open.onsuccess = () => {
      const request = open.result.transaction('records').objectStore('records').getAll();
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    };
  }));
}

try {
  for (const viewport of [
    { name: 'phone', width: 390, height: 844 },
    { name: 'desktop', width: 1440, height: 900 }
  ]) {
    const context = await browser.newContext({ viewport: { width: viewport.width, height: viewport.height }, serviceWorkers: 'block' });
    const page = await context.newPage();
    const errors = [];
    page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
    page.on('pageerror', (error) => errors.push(error.message));
    await page.goto(base + '/', { waitUntil: 'networkidle' });
    const h1 = page.getByRole('heading', { level: 1 });
    const audience = page.getByText('For households that need a clear record of when recurring work was finished.');
    const action = page.getByRole('link', { name: 'Try it with sample data' });
    const next = page.getByText('See a filled calendar in one click.');
    const facts = page.locator('.plain-facts li');
    const metrics = await Promise.all([h1, audience, action, next].map(async (locator) => {
      const box = await locator.boundingBox();
      return { text: await locator.textContent(), visible: await locator.isVisible(), box, aboveFold: Boolean(box && box.y + box.height <= viewport.height) };
    }));
    report.coldRead.push({ viewport, scrollY: await page.evaluate(() => scrollY), title: await page.title(), h1: metrics[0], audience: metrics[1], firstAction: metrics[2], actionResult: metrics[3], facts: await facts.allTextContents(), errors });
    await page.screenshot({ path: `${out}/cold-${viewport.name}.png` });
    assert(metrics.every((item) => item.visible && item.aboveFold), `${viewport.name} first read is not fully above the fold`);
    assert((await facts.count()) === 3, `${viewport.name} fact count changed`);
    await context.close();
  }

  {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 }, acceptDownloads: true, serviceWorkers: 'block' });
    const page = await context.newPage();
    const requests = [];
    const errors = [];
    page.on('request', (request) => requests.push({ method: request.method(), type: request.resourceType(), url: request.url() }));
    page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
    page.on('pageerror', (error) => errors.push(error.message));
    await page.goto(base + '/app');
    await page.getByRole('button', { name: 'Add a chore' }).click();
    await page.getByLabel('Chore name').fill('Real calendar sentinel');
    await page.getByRole('button', { name: 'Save chore' }).click();
    await page.evaluate(() => {
      localStorage.setItem('review4:sentinel', 'unchanged');
      localStorage.setItem('sb_license:chore-proof-calendar', 'real-license-sentinel');
      localStorage.setItem('sb_license_verdict:chore-proof-calendar', JSON.stringify({ valid: true, checkedAt: Date.now() }));
      sessionStorage.setItem('review4:session', 'unchanged');
    });
    const beforeRows = await databaseRows(page);
    const beforeStorage = await page.evaluate(() => ({ local: { ...localStorage }, session: { ...sessionStorage } }));
    requests.length = 0;

    await page.goto(base + '/');
    await page.getByRole('link', { name: 'Try it with sample data' }).click();
    await page.waitForURL(/demo=1/);
    const banner = page.getByText('Demo — sample data, nothing is saved');
    const sumEvents = async () => page.locator('.calendar-day i').evaluateAll((nodes) => nodes.reduce((sum, node) => sum + Number(node.textContent || 0), 0));
    await page.screenshot({ path: `${out}/demo-first-phone.png` });
    await page.locator('.calendar-section').screenshot({ path: `${out}/one-click-empty-calendar-phone.png` });
    const initialDownload = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Export JSON' }).click();
    const initialStream = await (await initialDownload).createReadStream();
    let initialBody = '';
    for await (const chunk of initialStream) initialBody += chunk.toString();
    const initialBackup = JSON.parse(initialBody);
    const initial = { chores: await page.locator('.chore-card').count(), storedCompletions: initialBackup.completions.length, visibleCalendarCompletions: await sumEvents(), calendarHeading: await page.locator('.calendar-head strong').textContent(), banner: await banner.isVisible(), reset: await page.getByRole('button', { name: 'Reset demo' }).isVisible(), start: await page.getByRole('link', { name: 'Start for real' }).isVisible() };
    await page.goto(base + '/demo');
    const direct = { chores: await page.locator('.chore-card').count(), completions: await sumEvents(), calendarHeading: await page.locator('.calendar-head strong').textContent(), banner: await banner.isVisible() };
    await page.getByRole('button', { name: 'Mark done' }).first().click();
    const mutatedDownload = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Export JSON' }).click();
    const mutatedStream = await (await mutatedDownload).createReadStream();
    let mutatedBody = '';
    for await (const chunk of mutatedStream) mutatedBody += chunk.toString();
    const mutated = { chores: await page.locator('.chore-card').count(), storedCompletions: JSON.parse(mutatedBody).completions.length, visibleCalendarCompletions: await sumEvents(), calendarHeading: await page.locator('.calendar-head strong').textContent(), banner: await banner.isVisible() };
    await page.getByRole('button', { name: 'Reset demo' }).click();
    const resetDownload = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Export JSON' }).click();
    const resetStream = await (await resetDownload).createReadStream();
    let resetBody = '';
    for await (const chunk of resetStream) resetBody += chunk.toString();
    const reset = { chores: await page.locator('.chore-card').count(), storedCompletions: JSON.parse(resetBody).completions.length, visibleCalendarCompletions: await sumEvents(), calendarHeading: await page.locator('.calendar-head strong').textContent(), banner: await banner.isVisible() };
    await page.locator('.calendar-section').screenshot({ path: `${out}/reset-empty-calendar-phone.png` });
    await page.reload();
    const reloaded = { chores: await page.locator('.chore-card').count(), completions: await sumEvents(), banner: await banner.isVisible() };
    await page.goto(base + '/demo?license=demo-must-be-ignored');
    const licenseQueryStripped = page.url() === base + '/demo';
    const demoShowsPaid = await page.getByText('Household Pack active').count();
    const afterRows = await databaseRows(page);
    const afterStorage = await page.evaluate(() => ({ local: { ...localStorage }, session: { ...sessionStorage } }));
    const external = requests.filter((request) => new URL(request.url).origin !== base);
    report.demo = { oneClick: initial, direct, mutated, reset, reloaded, licenseQueryStripped, demoShowsPaid, errors, oneClickFilledCalendar: initial.visibleCalendarCompletions === initial.storedCompletions };
    report.isolation = { rowsUnchanged: JSON.stringify(beforeRows) === JSON.stringify(afterRows), storageUnchanged: JSON.stringify(beforeStorage) === JSON.stringify(afterStorage), beforeRows: beforeRows.map(({ kind, name }) => ({ kind, name })), afterRows: afterRows.map(({ kind, name }) => ({ kind, name })), externalRequests: external };
    assert(initial.chores === 4 && initial.storedCompletions === 7 && initial.banner && initial.reset && initial.start, 'sample did not start populated');
    assert(direct.completions === 7 && direct.banner, 'direct sample calendar was not populated');
    assert(mutated.storedCompletions === 8 && mutated.banner, 'sample mutation or persistent label failed');
    assert(reset.storedCompletions === 7 && reloaded.completions === 7 && reset.banner && reloaded.banner, 'sample reset or reload failed');
    assert(demoShowsPaid === 0, 'demo read real license state');
    assert(report.isolation.rowsUnchanged && report.isolation.storageUnchanged && external.length === 0, 'demo changed real state or made an external request');
    assert(errors.length === 0, 'browser errors occurred in demo flow');
    await context.close();
  }

  {
    const context = await browser.newContext({ serviceWorkers: 'block' });
    const page = await context.newPage();
    await page.goto(base + '/', { waitUntil: 'networkidle' });
    const hrefs = await page.locator('a[href]').evaluateAll((links) => [...new Set(links.map((link) => link.href))]);
    const results = [];
    for (const href of hrefs) {
      if (href.includes('/checkout') || href.startsWith('mailto:')) continue;
      const response = await context.request.get(href, { maxRedirects: 5 });
      results.push({ href, status: response.status() });
    }
    report.links = { discovered: hrefs, checked: results, failures: results.filter((item) => item.status >= 400) };
    assert(report.links.failures.length === 0, 'landing page has broken links');
    await context.close();
  }
} finally {
  await browser.close();
  writeFileSync(`${out}/review-live.json`, JSON.stringify(report, null, 2) + '\n');
}

console.log(JSON.stringify(report, null, 2));
