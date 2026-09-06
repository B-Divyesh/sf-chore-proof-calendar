/* global process, console, indexedDB, URL */
import { chromium } from '@playwright/test';
import { mkdirSync, writeFileSync } from 'node:fs';

const base = process.argv[2] ?? 'http://127.0.0.1:4173';
const output = process.argv[3] ?? '.factory/evidence-repair-9/sample-calendar.json';
const outputDirectory = output.slice(0, output.lastIndexOf('/'));
mkdirSync(outputDirectory, { recursive: true });

const browser = await chromium.launch();
const results = [];
const assert = (condition, message) => { if (!condition) throw new Error(message); };

try {
  for (const viewport of [
    { name: 'desktop', width: 1440, height: 900 },
    { name: 'phone', width: 390, height: 844 }
  ]) {
    const context = await browser.newContext({ viewport, serviceWorkers: 'block' });
    const page = await context.newPage();
    await page.clock.install({ time: new Date('2026-09-06T12:00:00.000Z') });
    const errors = [];
    const requests = [];
    page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
    page.on('pageerror', (error) => errors.push(error.message));
    page.on('request', (request) => requests.push(request.url()));

    await page.goto(`${base}/`, { waitUntil: 'networkidle' });
    const job = page.getByRole('heading', { level: 1 });
    const audience = page.getByText('For households that need a clear record of when recurring work was finished.');
    const firstAction = page.getByRole('link', { name: 'Try it with sample data' });
    const firstScreen = {};
    for (const [name, locator] of Object.entries({ job, audience, firstAction })) {
      const box = await locator.boundingBox();
      firstScreen[name] = { text: await locator.textContent(), visible: await locator.isVisible(), aboveFold: Boolean(box && box.y + box.height <= viewport.height) };
    }
    await page.screenshot({ path: `${outputDirectory}/first-read-${viewport.name}.png` });

    const storedBefore = await page.evaluate(async () => {
      const db = await new Promise((resolve, reject) => {
        const request = indexedDB.open('done-here:v1', 1);
        request.onupgradeneeded = () => request.result.createObjectStore('records', { keyPath: 'id' });
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
      await new Promise((resolve, reject) => {
        const transaction = db.transaction('records', 'readwrite');
        transaction.objectStore('records').put({ id: 'real-sentinel', kind: 'chore', name: 'Real calendar sentinel', intervalDays: 14, createdAt: '2026-09-01T09:00:00.000Z' });
        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(transaction.error);
      });
      return await new Promise((resolve, reject) => {
        const request = db.transaction('records').objectStore('records').getAll();
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
    });

    await firstAction.click();
    const sumMarks = () => page.locator('.calendar-day.has-events i').evaluateAll((marks) => marks.reduce((sum, mark) => sum + Number(mark.textContent), 0));
    const initial = {
      month: await page.locator('.calendar-head strong').textContent(),
      populatedDays: await page.locator('.calendar-day.has-events').count(),
      completions: await sumMarks(),
      selectedDate: await page.locator('.calendar-day.selected').getAttribute('data-date'),
      sampleLabel: await page.getByText('Demo — sample data, nothing is saved').isVisible()
    };
    await page.locator('.calendar-section').screenshot({ path: `${outputDirectory}/sample-calendar-${viewport.name}.png` });

    await page.getByRole('button', { name: 'Mark done' }).first().click();
    const changedMonth = await page.locator('.calendar-head strong').textContent();
    await page.getByRole('button', { name: 'Reset demo' }).click();
    const reset = {
      month: await page.locator('.calendar-head strong').textContent(),
      populatedDays: await page.locator('.calendar-day.has-events').count(),
      completions: await sumMarks(),
      selectedDate: await page.locator('.calendar-day.selected').getAttribute('data-date'),
      sampleLabel: await page.getByText('Demo — sample data, nothing is saved').isVisible(),
      feedback: await page.getByText('Sample data reset.').isVisible()
    };
    const storedAfter = await page.evaluate(async () => {
      const db = await new Promise((resolve, reject) => {
        const request = indexedDB.open('done-here:v1', 1);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
      return await new Promise((resolve, reject) => {
        const request = db.transaction('records').objectStore('records').getAll();
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
    });
    const externalRequests = requests.filter((url) => new URL(url).origin !== new URL(base).origin);
    const realStorageUnchanged = JSON.stringify(storedAfter) === JSON.stringify(storedBefore);

    assert(Object.values(firstScreen).every((item) => item.visible && item.aboveFold), `${viewport.name}: first screen is incomplete`);
    assert(initial.month === 'August 2026' && initial.populatedDays === 6 && initial.completions === 7 && initial.selectedDate === '2026-08-27' && initial.sampleLabel, `${viewport.name}: one-click calendar is not populated`);
    assert(changedMonth === 'September 2026', `${viewport.name}: cross-month setup did not run`);
    assert(reset.month === 'August 2026' && reset.populatedDays === 6 && reset.completions === 7 && reset.selectedDate === '2026-08-27' && reset.sampleLabel && reset.feedback, `${viewport.name}: reset calendar is not populated`);
    assert(realStorageUnchanged, `${viewport.name}: demo changed real storage`);
    assert(externalRequests.length === 0 && errors.length === 0, `${viewport.name}: browser errors or external requests occurred`);
    results.push({ viewport, firstScreen, initial, changedMonth, reset, realStorageUnchanged, externalRequests, errors });
    await context.close();
  }
} finally {
  await browser.close();
}

writeFileSync(output, `${JSON.stringify(results, null, 2)}\n`);
console.log(JSON.stringify(results, null, 2));
