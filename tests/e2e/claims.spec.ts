import { expect, test } from '@playwright/test';
import axe from 'axe-core';

test('@claim:demo-sandbox loads sample data without touching real storage', async ({ page }) => {
  await page.goto('/demo');
  await expect(page.getByText('Demo — sample data, nothing is saved')).toBeVisible();
  await expect(page.getByText('Water the houseplants').first()).toBeVisible();
  const before = await page.locator('.day-history li').count();
  await page.getByRole('button', { name: 'Mark done' }).first().click();
  await expect(page.getByText('marked done')).toBeVisible();
  await page.reload();
  await expect(page.getByText('Demo — sample data, nothing is saved')).toBeVisible();
  expect(await page.locator('.day-history li').count()).toBe(before);
  expect(await page.evaluate(() => Object.keys(localStorage).filter((key) => key.startsWith('demo:')))).toEqual([]);
});

test('@claim:one-tap-completion adds a dated completion in one action', async ({ page }) => {
  await page.goto('/demo');
  const chore = page.locator('.chore-card').first();
  const name = await chore.getByRole('heading').textContent();
  await chore.getByRole('button', { name: 'Mark done' }).click();
  await expect(page.locator('.day-history')).toContainText(name!);
});

test('@claim:offline-reload works offline after the first visit', async ({ page, context }) => {
  await page.goto('/demo');
  await page.waitForFunction(() => 'serviceWorker' in navigator && Boolean(navigator.serviceWorker.controller));
  await page.waitForFunction(async () => {
    const cache = await caches.open('done-here-v3');
    const shell = await cache.match('/index.html');
    const demo = await cache.match('/demo');
    return Boolean(shell && demo && (await shell.text()).includes('Keep a record of every chore'));
  });
  await context.setOffline(true);
  await page.reload();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Keep a record of every chore');
  await expect(page.getByText('Offline. Your calendar still works here.')).toBeVisible();
});

test('@claim:local-data sends no chore data away during the demo flow', async ({ page }) => {
  const remote: string[] = [];
  page.on('request', (request) => { if (new URL(request.url()).origin !== 'http://127.0.0.1:4173') remote.push(request.url()); });
  await page.goto('/demo');
  await page.getByRole('button', { name: 'Mark done' }).first().click();
  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export JSON' }).click();
  await download;
  expect(remote).toEqual([]);
});

test('@claim:json-export downloads the full sample backup', async ({ page }) => {
  await page.goto('/demo');
  const pending = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export JSON' }).click();
  const file = await pending;
  const stream = await file.createReadStream();
  let body = '';
  for await (const chunk of stream!) body += chunk.toString();
  const parsed = JSON.parse(body);
  expect(parsed.chores).toHaveLength(4);
  expect(parsed.completions).toHaveLength(7);
});

test('@claim:json-restore restores every record from a sample backup', async ({ page }) => {
  await page.goto('/demo');
  const exported = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export JSON' }).click();
  const stream = await (await exported).createReadStream();
  const chunks: Buffer[] = [];
  for await (const chunk of stream!) chunks.push(Buffer.from(chunk));
  const backup = Buffer.concat(chunks);

  await page.getByRole('link', { name: 'Start for real' }).click();
  await expect(page).toHaveURL(/\/app$/);
  await page.getByLabel('Import JSON').setInputFiles({
    name: 'done-here-sample.json',
    mimeType: 'application/json',
    buffer: backup
  });
  await expect(page.getByText('Backup imported.')).toBeVisible();
  await expect(page.locator('.chore-card')).toHaveCount(4);

  const restoredExport = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export JSON' }).click();
  const restoredStream = await (await restoredExport).createReadStream();
  let restoredBody = '';
  for await (const chunk of restoredStream!) restoredBody += chunk.toString();
  const restored = JSON.parse(restoredBody);
  expect(restored.chores).toHaveLength(4);
  expect(restored.completions).toHaveLength(7);
});

test('@claim:recurrence-bounds accepts named chores from 1 through 365 days', async ({ page }) => {
  await page.goto('/demo');
  await page.getByRole('button', { name: 'Add a chore' }).click();
  await page.getByLabel('Chore name').fill('Daily kitchen check');
  const interval = page.getByLabel('Due every');

  await interval.fill('0');
  await page.getByRole('button', { name: 'Save chore' }).click();
  expect(await interval.evaluate((input: HTMLInputElement) => input.validity.rangeUnderflow)).toBe(true);

  await interval.fill('1');
  await page.getByRole('button', { name: 'Save chore' }).click();
  const daily = page.locator('.chore-card').filter({ hasText: 'Daily kitchen check' });
  await expect(daily).toContainText('Every 1 day');

  await page.getByRole('button', { name: 'Add a chore' }).click();
  await page.getByLabel('Chore name').fill('Annual cupboard check');
  const annualInterval = page.getByLabel('Due every');
  await annualInterval.fill('366');
  await page.getByRole('button', { name: 'Save chore' }).click();
  expect(await annualInterval.evaluate((input: HTMLInputElement) => input.validity.rangeOverflow)).toBe(true);

  await annualInterval.fill('365');
  await page.getByRole('button', { name: 'Save chore' }).click();
  const annual = page.locator('.chore-card').filter({ hasText: 'Annual cupboard check' });
  await expect(annual).toContainText('Every 365 days');
});

test('@claim:due-status shows matching next dates and calendar-day labels', async ({ page }) => {
  await page.clock.install({ time: new Date('2026-08-28T16:00:45.000Z') });
  await page.goto('/app');
  await page.getByRole('button', { name: 'Add a chore' }).click();
  await page.getByLabel('Chore name').fill('Daily sink wipe');
  await page.getByLabel('Due every').fill('1');
  await page.getByRole('button', { name: 'Save chore' }).click();
  const card = page.locator('.chore-card').filter({ hasText: 'Daily sink wipe' });
  await expect(card).toContainText('Due today');
  await expect(card).toContainText('next Aug 28, 2026');

  await card.getByRole('button', { name: 'Mark done' }).click();
  await expect(card).toContainText('Due in 1 day');
  await expect(card).toContainText('next Aug 29, 2026');
});

test('@claim:completion-proof saves an optional note and consented photo', async ({ page }) => {
  await page.goto('/demo');
  await page.getByRole('button', { name: 'Add note or photo' }).first().click();
  await page.getByLabel('Note optional').fill('Filter rinsed and left to dry.');
  await page.getByLabel('Photo optional').setInputFiles({
    name: 'filter.png',
    mimeType: 'image/png',
    buffer: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=', 'base64')
  });
  await page.getByLabel('Anyone shown in this photo agreed to store it here.').check();
  await page.getByRole('button', { name: 'Mark done with proof' }).click();
  const history = page.locator('.day-history');
  await expect(history).toContainText('Filter rinsed and left to dry.');
  await expect(history.getByRole('img', { name: 'Photo saved with this completion' })).toBeVisible();
});

test('@claim:keyboard-calendar changes months and selects days from the keyboard', async ({ page }) => {
  await page.goto('/demo');
  await expect(page.locator('.calendar-head strong')).toHaveText('August 2026');
  await page.getByRole('button', { name: 'Next month' }).focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('.calendar-head strong')).toHaveText('September 2026');

  const dayTen = page.locator('[data-date="2026-09-10"]');
  await dayTen.focus();
  await page.keyboard.press('ArrowRight');
  await expect(page.locator('[data-date="2026-09-11"]')).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('[data-date="2026-09-11"]')).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('#day-title')).toContainText('Sep 11, 2026');
});

test('@claim:paid-photo-cap reaches a live Sociobot checkout for the stated price', async ({ page, request }) => {
  await page.goto('/');
  const buy = page.getByRole('link', { name: 'Buy Household Pack — $12' });
  const checkoutUrl = 'https://api.sociobot.in/api/v1/products/chore-proof-calendar/checkout';
  await expect(buy).toHaveAttribute('href', checkoutUrl);
  await expect(page.getByText('Pay $12 once to store up to 500 photos.')).toBeVisible();
  const response = await request.get(checkoutUrl, { maxRedirects: 0 });
  expect(response.status()).toBe(303);
  expect(response.headers().location).toMatch(/^https:\/\/checkout\.dodopayments\.com\//);
});

test('@claim:accessible-baseline has no serious Axe findings on mobile demo', async ({ page }) => {
  await page.goto('/demo');
  await page.evaluate(axe.source);
  const results = await page.evaluate(async () => await (window as typeof window & { axe: typeof axe }).axe.run(document));
  expect(results.violations.filter((item) => ['serious', 'critical'].includes(item.impact ?? ''))).toEqual([]);
  expect(await page.locator('h1').count()).toBe(1);
  await expect(page.locator('main')).toHaveCount(1);
});
