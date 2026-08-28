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
    const cache = await caches.open('done-here-v2');
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

test('@claim:paid-photo-cap states the price and uses the Sociobot checkout', async ({ page }) => {
  await page.goto('/');
  const buy = page.getByRole('link', { name: 'Buy Household Pack — $12' });
  await expect(buy).toHaveAttribute('href', 'https://api.sociobot.in/api/v1/products/chore-proof-calendar/checkout');
  await expect(page.getByText('Pay $12 once to store up to 500 photos.')).toBeVisible();
});

test('@claim:accessible-baseline has no serious Axe findings on mobile demo', async ({ page }) => {
  await page.goto('/demo');
  await page.evaluate(axe.source);
  const results = await page.evaluate(async () => await (window as typeof window & { axe: typeof axe }).axe.run(document));
  expect(results.violations.filter((item) => ['serious', 'critical'].includes(item.impact ?? ''))).toEqual([]);
  expect(await page.locator('h1').count()).toBe(1);
  await expect(page.locator('main')).toHaveCount(1);
});
