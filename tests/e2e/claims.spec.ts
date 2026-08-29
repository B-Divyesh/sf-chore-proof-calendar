import { expect, test } from '@playwright/test';
import axe from 'axe-core';

test('@claim:demo-sandbox loads sample data without touching real storage', async ({ page }) => {
  const realStorage = {
    'sb_license:chore-proof-calendar': 'real-household-license',
    'sb_license_verdict:chore-proof-calendar': JSON.stringify({ valid: true, checkedAt: 4_102_444_800_000 }),
    'real:calendar-preference': 'kept'
  };
  await page.addInitScript((seed) => {
    for (const [key, value] of Object.entries(seed)) localStorage.setItem(key, value);
  }, realStorage);
  const licenseRequests: string[] = [];
  page.on('request', (request) => {
    if (request.url().includes('/products/chore-proof-calendar/verify')) licenseRequests.push(request.url());
  });

  await page.goto('/demo?license=demo-should-not-save');
  await expect(page.getByText('Demo — sample data, nothing is saved')).toBeVisible();
  await expect(page.getByText('Water the houseplants').first()).toBeVisible();
  await expect(page.getByText('Household Pack active')).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Have a license? Paste it' })).toHaveCount(0);
  const before = await page.locator('.day-history li').count();
  await page.getByRole('button', { name: 'Mark done' }).first().click();
  await expect(page.getByText('marked done')).toBeVisible();
  await page.reload();
  await expect(page.getByText('Demo — sample data, nothing is saved')).toBeVisible();
  expect(await page.locator('.day-history li').count()).toBe(before);
  expect(await page.evaluate(() => Object.fromEntries(Object.entries(localStorage).sort()))).toEqual(realStorage);
  await page.goto('/app?demo=1&license=another-demo-token');
  await expect(page.getByText('Demo — sample data, nothing is saved')).toBeVisible();
  expect(await page.evaluate(() => Object.fromEntries(Object.entries(localStorage).sort()))).toEqual(realStorage);
  expect(licenseRequests).toEqual([]);
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
    const cache = await caches.open('done-here-v7');
    const shell = await cache.match('/index.html');
    const demo = await cache.match('/demo');
    return Boolean(shell && demo && (await shell.text()).includes('Keep a record of every chore'));
  });
  await context.setOffline(true);
  await page.reload();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Keep a record of every chore');
  await expect(page.getByText('Offline. Your calendar still works here.')).toBeVisible();
});

test('@claim:installable-pwa provides a valid standalone manifest and controlled app shell', async ({ page }) => {
  await page.goto('/app');
  await expect(page.locator('link[rel="manifest"]')).toHaveAttribute('href', '/manifest.webmanifest');

  const manifestResponse = await page.request.get('/manifest.webmanifest');
  expect(manifestResponse.ok()).toBe(true);
  const manifest = await manifestResponse.json() as {
    name: string;
    short_name: string;
    start_url: string;
    display: string;
    icons: Array<{ src: string; sizes: string; purpose: string }>;
  };
  expect(manifest).toMatchObject({ name: expect.stringContaining('Done Here'), short_name: 'Done Here', start_url: '/app?v=7', display: 'standalone' });
  expect(manifest.icons).toEqual(expect.arrayContaining([
    expect.objectContaining({ sizes: '192x192', purpose: expect.stringContaining('maskable') }),
    expect.objectContaining({ sizes: '512x512', purpose: expect.stringContaining('maskable') })
  ]));
  for (const icon of manifest.icons) {
    const response = await page.request.get(icon.src);
    expect(response.ok(), icon.src).toBe(true);
    expect(response.headers()['content-type']).toContain('image/png');
    const png = await response.body();
    const [declaredWidth, declaredHeight] = icon.sizes.split('x').map(Number);
    expect(png.readUInt32BE(16), `${icon.src} width`).toBe(declaredWidth);
    expect(png.readUInt32BE(20), `${icon.src} height`).toBe(declaredHeight);
  }

  const cdp = await page.context().newCDPSession(page);
  const appManifest = await cdp.send('Page.getAppManifest');
  expect(appManifest.errors).toEqual([]);
  await page.waitForFunction(() => 'serviceWorker' in navigator && Boolean(navigator.serviceWorker.controller));
  expect(await page.evaluate(async () => (await navigator.serviceWorker.ready).scope)).toBe('http://127.0.0.1:4173/');
});

test('@claim:no-account creates and completes a real calendar without an account', async ({ page }) => {
  const remoteRequests: string[] = [];
  page.on('request', (request) => {
    if (new URL(request.url()).origin !== 'http://127.0.0.1:4173') remoteRequests.push(request.url());
  });
  await page.goto('/app');
  await page.getByRole('button', { name: 'Add a chore' }).click();
  await page.getByLabel('Chore name').fill('Wipe the pantry shelf');
  await page.getByRole('button', { name: 'Save chore' }).click();
  const chore = page.locator('.chore-card').filter({ hasText: 'Wipe the pantry shelf' });
  await chore.getByRole('button', { name: 'Mark done' }).click();
  await expect(page.locator('.day-history')).toContainText('Wipe the pantry shelf');
  await expect(page.getByText(/sign in|create account|log in/i)).toHaveCount(0);
  expect(remoteRequests).toEqual([]);
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

test('@claim:runtime-privacy loads no analytics, remote fonts, or third-party runtime scripts', async ({ page }) => {
  const requests: Array<{ type: string; url: string }> = [];
  page.on('request', (request) => requests.push({ type: request.resourceType(), url: request.url() }));

  await page.goto('/demo');
  await page.getByRole('button', { name: 'Mark done' }).first().click();
  const pending = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export JSON' }).click();
  await pending;

  expect(requests.filter(({ url }) => new URL(url).origin !== 'http://127.0.0.1:4173')).toEqual([]);
  expect(requests.filter(({ type }) => type === 'font')).toEqual([]);
  expect(requests.map(({ url }) => url).join('\n')).not.toMatch(/analytics|telemetry|tracking|collect|beacon/i);
});

test('@claim:license-token-only sends only the pasted token to Sociobot verification', async ({ page }) => {
  const token = 'sbk_test token/&?';
  const remoteRequests: Array<{ method: string; postData: string | null; url: string }> = [];
  await page.route('https://api.sociobot.in/**', async (route) => {
    const request = route.request();
    remoteRequests.push({ method: request.method(), postData: request.postData(), url: request.url() });
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      headers: { 'Access-Control-Allow-Origin': 'http://127.0.0.1:4173' },
      body: JSON.stringify({ valid: false, reason: 'invalid' })
    });
  });

  await page.goto('/app');
  await page.getByRole('button', { name: 'Have a license? Paste it' }).click();
  await page.getByLabel('License').fill(token);
  await page.getByRole('button', { name: 'Verify license' }).click();
  await expect(page.getByRole('status').filter({ hasText: 'This license is not active.' })).toBeVisible();

  expect(remoteRequests).toHaveLength(1);
  const verification = new URL(remoteRequests[0].url);
  expect(remoteRequests[0]).toMatchObject({ method: 'GET', postData: null });
  expect(verification.origin).toBe('https://api.sociobot.in');
  expect(verification.pathname).toBe('/api/v1/products/chore-proof-calendar/verify');
  expect([...verification.searchParams]).toEqual([['license', token]]);
});

test('@claim:refunded-license relocks paid photo storage after a revoked verdict', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('sb_license:chore-proof-calendar', 'refunded-license');
    localStorage.setItem('sb_license_verdict:chore-proof-calendar', JSON.stringify({ valid: true, checkedAt: 0 }));
  });
  await page.route('https://api.sociobot.in/**', (route) => route.fulfill({
    status: 200,
    contentType: 'application/json',
    headers: { 'Access-Control-Allow-Origin': 'http://127.0.0.1:4173' },
    body: JSON.stringify({ valid: false, reason: 'revoked' })
  }));

  await page.goto('/app');
  await expect(page.getByText('This license is no longer active.')).toBeVisible();
  await expect(page.getByText('Household Pack active')).toHaveCount(0);
  await expect(page.getByRole('link', { name: 'Buy Household Pack — $12' })).toBeVisible();

  const photo = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=';
  const backup = {
    chores: [{ id: 'refunded-chore', name: 'Wipe the fridge handle', intervalDays: 1, createdAt: '2026-08-20T12:00:00.000Z' }],
    completions: Array.from({ length: 5 }, (_, index) => ({ id: `proof-${index}`, choreId: 'refunded-chore', completedAt: `2026-08-2${index + 1}T12:00:00.000Z`, photo }))
  };
  await page.getByLabel('Import JSON').setInputFiles({ name: 'five-photos.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(backup)) });
  const chore = page.locator('.chore-card').filter({ hasText: 'Wipe the fridge handle' });
  await chore.getByRole('button', { name: 'Add note or photo' }).click();
  await page.getByLabel('Photo optional').setInputFiles({ name: 'sixth.png', mimeType: 'image/png', buffer: Buffer.from(photo.split(',')[1], 'base64') });
  await page.getByLabel('Anyone shown in this photo agreed to store it here.').check();
  await page.getByRole('button', { name: 'Mark done with proof' }).click();
  await expect(page.getByText('The free photo limit is five.')).toBeVisible();
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

test('@claim:no-household-ranking records chores without people, points, or rankings', async ({ page }) => {
  await page.goto('/demo');
  await page.getByRole('button', { name: 'Mark done' }).first().click();
  const pending = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export JSON' }).click();
  const stream = await (await pending).createReadStream();
  let body = '';
  for await (const chunk of stream!) body += chunk.toString();
  const backup = JSON.parse(body) as { chores: Array<Record<string, unknown>>; completions: Array<Record<string, unknown>> };
  const keys = [...backup.chores, ...backup.completions].flatMap((record) => Object.keys(record));
  expect(keys).not.toEqual(expect.arrayContaining(['assignee', 'child', 'person', 'points', 'rank', 'score']));
  await expect(page.locator('[data-ranking], [data-points], [data-assignee]')).toHaveCount(0);
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

test('@claim:free-core keeps chores, notes, calendar history, and every export available without a license', async ({ page }) => {
  const remoteRequests: string[] = [];
  page.on('request', (request) => {
    if (new URL(request.url()).origin !== 'http://127.0.0.1:4173') remoteRequests.push(request.url());
  });
  await page.goto('/app');
  expect(await page.evaluate(() => Object.keys(localStorage).filter((key) => key.startsWith('sb_license:')))).toEqual([]);
  await page.getByRole('button', { name: 'Add a chore' }).click();
  await page.getByLabel('Chore name').fill('Clean the free calendar test shelf');
  await page.getByRole('button', { name: 'Save chore' }).click();
  const chore = page.locator('.chore-card').filter({ hasText: 'Clean the free calendar test shelf' });
  await chore.getByRole('button', { name: 'Add note or photo' }).click();
  await page.getByLabel('Note optional').fill('Saved without a Household Pack.');
  await page.getByRole('button', { name: 'Mark done with proof' }).click();
  await expect(page.locator('.day-history')).toContainText('Saved without a Household Pack.');

  for (const kind of ['ICS', 'PDF', 'CSV', 'JSON']) {
    const pending = page.waitForEvent('download');
    await page.getByRole('button', { name: `Export ${kind}` }).click();
    const file = await pending;
    expect(file.suggestedFilename()).toMatch(new RegExp(`\\.${kind.toLowerCase()}$`));
  }
  expect(remoteRequests).toEqual([]);
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
