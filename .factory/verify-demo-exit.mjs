/* global process, console, indexedDB */
import { chromium } from '@playwright/test';
import { writeFileSync } from 'node:fs';

const base = process.argv[2] ?? 'http://127.0.0.1:4173';
const output = process.argv[3] ?? '.factory/demo-exit.json';
const browser = await chromium.launch();
const results = [];

try {
  for (const exit of ['Start for real', 'Calendar']) {
    const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
    const page = await context.newPage();
    const existingName = `Existing record for ${exit}`;
    const newName = `New record after ${exit}`;

    await page.goto(`${base}/app`);
    await page.getByRole('button', { name: 'Add a chore' }).click();
    await page.getByLabel('Chore name').fill(existingName);
    await page.getByRole('button', { name: 'Save chore' }).click();
    const existing = page.locator('.chore-card').filter({ hasText: existingName });
    await existing.waitFor();
    await existing.getByRole('button', { name: 'Mark done' }).click();
    await page.locator('.day-history').getByText(existingName).waitFor();
    await page.reload();
    await page.getByRole('heading', { name: existingName }).waitFor();

    await page.goto(`${base}/demo`);
    await page.getByRole('link', { name: exit, exact: true }).click();
    await page.waitForURL('**/app');
    await page.getByRole('heading', { name: existingName }).waitFor();

    await page.getByRole('button', { name: 'Add a chore' }).click();
    await page.getByLabel('Chore name').fill(newName);
    await page.getByRole('button', { name: 'Save chore' }).click();
    await page.getByRole('heading', { name: newName }).waitFor();
    await page.reload();

    const visibleNames = await page.locator('.chore-card h3').allTextContents();
    const stored = await page.evaluate(async () => new Promise((resolve, reject) => {
      const open = indexedDB.open('done-here:v1', 1);
      open.onerror = () => reject(open.error);
      open.onsuccess = () => {
        const request = open.result.transaction('records').objectStore('records').getAll();
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result.map(({ kind, id, choreId, name }) => ({ kind, id, choreId, name })));
      };
    }));
    results.push({ exit, visibleNames, stored });
    await context.close();
  }
} finally {
  await browser.close();
}

writeFileSync(output, JSON.stringify(results, null, 2));
console.log(JSON.stringify(results, null, 2));
const failed = results.some(({ exit, visibleNames, stored }) => {
  const existingName = `Existing record for ${exit}`;
  const newName = `New record after ${exit}`;
  return !visibleNames.includes(existingName)
    || !visibleNames.includes(newName)
    || !stored.some((row) => row.kind === 'chore' && row.name === existingName)
    || !stored.some((row) => row.kind === 'chore' && row.name === newName)
    || !stored.some((row) => row.kind === 'completion');
});
process.exitCode = failed ? 1 : 0;
