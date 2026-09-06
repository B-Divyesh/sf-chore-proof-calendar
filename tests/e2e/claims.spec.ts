import { expect, test, type Download, type Page } from '@playwright/test';
import axe from 'axe-core';

type Backup = {
  chores: Array<{ id: string; name: string; intervalDays: number; createdAt: string; archived?: boolean }>;
  completions: Array<{ id: string; choreId: string; completedAt: string; note?: string; photo?: string }>;
};

const PHOTO_BASE64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=';
const PHOTO_DATA_URL = `data:image/png;base64,${PHOTO_BASE64}`;

const richBackup = (): Backup => ({
  chores: [
    { id: 'active-proof-chore', name: 'Clean the café drain', intervalDays: 29, createdAt: '2026-08-02T08:15:00.000Z', archived: false },
    { id: 'archived-proof-chore', name: 'Wash the balcony rail', intervalDays: 365, createdAt: '2026-03-01T09:45:00.000Z', archived: true }
  ],
  completions: [
    { id: 'active-photo-proof', choreId: 'active-proof-chore', completedAt: '2026-08-03T12:30:00.000Z', note: 'Drain rinsed — no residue.', photo: PHOTO_DATA_URL },
    { id: 'archived-note-proof', choreId: 'archived-proof-chore', completedAt: '2026-08-04T14:00:00.000Z', note: 'Rail checked before rain.' }
  ]
});

async function readJsonDownload(download: Download): Promise<Backup> {
  const stream = await download.createReadStream();
  let body = '';
  for await (const chunk of stream!) body += chunk.toString();
  return JSON.parse(body) as Backup;
}

async function exportJson(page: Page): Promise<Backup> {
  const pending = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export JSON' }).click();
  return readJsonDownload(await pending);
}

function sortBackup(backup: Backup): Backup {
  return {
    chores: [...backup.chores].map((chore) => ({ ...chore })).sort((left, right) => left.id.localeCompare(right.id)),
    completions: [...backup.completions].map((completion) => ({ ...completion })).sort((left, right) => left.id.localeCompare(right.id))
  };
}

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

  await page.goto('/?demo=1&license=demo-should-not-save');
  await expect(page).toHaveURL(/\?demo=1/);
  await expect(page.getByText('Demo — sample data, nothing is saved')).toBeVisible();
  await expect(page.getByText('Water the houseplants').first()).toBeVisible();
  await expect(page.getByText('Household Pack active')).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Enter a license' })).toHaveCount(0);
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

  await page.goto('/');
  await page.getByRole('link', { name: 'Try it with sample data' }).click();
  await expect(page).toHaveURL(/\?demo=1$/);
  await expect(page.getByText('Demo — sample data, nothing is saved')).toBeVisible();
  expect(licenseRequests).toEqual([]);
});

test('@claim:filled-sample-calendar shows all sample completions after one click and reset', async ({ page }) => {
  await page.clock.install({ time: new Date('2026-09-06T12:00:00.000Z') });
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('See when each chore was done');

  const storedBefore = await page.evaluate(async () => {
    const db = await new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open('done-here:v1', 1);
      request.onupgradeneeded = () => request.result.createObjectStore('records', { keyPath: 'id' });
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction('records', 'readwrite');
      transaction.objectStore('records').put({ id: 'real-sentinel', kind: 'chore', name: 'Real calendar sentinel', intervalDays: 14, createdAt: '2026-09-01T09:00:00.000Z' });
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
    return await new Promise<unknown[]>((resolve, reject) => {
      const request = db.transaction('records').objectStore('records').getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  });

  await page.getByRole('link', { name: 'Try it with sample data' }).click();
  await expect(page.getByText('Demo — sample data, nothing is saved')).toBeVisible();

  const expectBundledCalendar = async () => {
    await expect(page.locator('.calendar-head strong')).toHaveText('August 2026');
    await expect(page.locator('.calendar-day.has-events')).toHaveCount(6);
    const marks = await page.locator('.calendar-day.has-events').evaluateAll((days) => Object.fromEntries(days.map((day) => [
      (day as HTMLElement).dataset.date,
      Number(day.querySelector('i')?.textContent)
    ]))) as Record<string, number>;
    expect(marks).toEqual({
      '2026-08-18': 1,
      '2026-08-20': 1,
      '2026-08-21': 1,
      '2026-08-24': 2,
      '2026-08-26': 1,
      '2026-08-27': 1
    });
    expect(Object.values(marks).reduce((total, count) => total + count, 0)).toBe(7);
    await expect(page.locator('[data-date="2026-08-27"]')).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('.day-history')).toContainText('Rinse the coffee filter');
  };

  await expectBundledCalendar();
  await page.getByRole('button', { name: 'Mark done' }).first().click();
  await expect(page.locator('.calendar-head strong')).toHaveText('September 2026');
  await expect(page.locator('.calendar-day.has-events')).toHaveCount(1);

  await page.getByRole('button', { name: 'Reset demo' }).click();
  await expect(page.getByText('Sample data reset.')).toBeVisible();
  await expectBundledCalendar();

  const storedAfter = await page.evaluate(async () => {
    const db = await new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open('done-here:v1', 1);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    return await new Promise<unknown[]>((resolve, reject) => {
      const request = db.transaction('records').objectStore('records').getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  });
  expect(storedAfter).toEqual(storedBefore);
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
    const cache = await caches.open('done-here-v11');
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
  expect(manifest).toMatchObject({ name: expect.stringContaining('Done Here'), short_name: 'Done Here', start_url: '/app?v=11', display: 'standalone' });
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
  await page.getByRole('button', { name: 'Enter a license' }).click();
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

test('@claim:json-export exports every field in a full backup', async ({ page }) => {
  const fixture = richBackup();
  await page.goto('/demo');
  await page.getByRole('link', { name: 'Start for real' }).click();
  await page.getByLabel('Import JSON').setInputFiles({
    name: 'full-household-backup.json',
    mimeType: 'application/json',
    buffer: Buffer.from(JSON.stringify(fixture))
  });
  await expect(page.getByText('Backup imported.')).toBeVisible();

  const exported = await exportJson(page);
  expect(sortBackup(exported)).toEqual(sortBackup(fixture));
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

test('@claim:json-restore restores every field in a full backup', async ({ page }) => {
  const fixture = richBackup();
  await page.goto('/demo');
  await page.getByRole('link', { name: 'Start for real' }).click();
  await expect(page).toHaveURL(/\/app$/);
  await page.getByLabel('Import JSON').setInputFiles({
    name: 'full-household-backup.json',
    mimeType: 'application/json',
    buffer: Buffer.from(JSON.stringify(fixture))
  });
  await expect(page.getByText('Backup imported.')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Clean the café drain' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Wash the balcony rail' })).toHaveCount(0);

  const restored = await exportJson(page);
  expect(sortBackup(restored)).toEqual(sortBackup(fixture));
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

test('@claim:completion-proof requires consent confirmation before saving an optional note and photo', async ({ page }) => {
  await page.goto('/demo');
  await page.getByRole('button', { name: 'Add note or photo' }).first().click();
  await page.getByLabel('Note optional').fill('Filter rinsed and left to dry.');
  await page.getByLabel('Photo optional').setInputFiles({
    name: 'filter.png',
    mimeType: 'image/png',
    buffer: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=', 'base64')
  });
  await page.getByRole('button', { name: 'Mark done with proof' }).click();
  await expect(page.getByText('Confirm photo consent before saving this photo.')).toBeVisible();
  await page.getByLabel('Anyone shown in this photo agreed to store it here.').check();
  await page.getByRole('button', { name: 'Mark done with proof' }).click();
  const history = page.locator('.day-history');
  await expect(history).toContainText('Filter rinsed and left to dry.');
  await expect(history.getByRole('img', { name: 'Photo saved with this completion' })).toBeVisible();
});

test('@claim:photo-json-local keeps a consented photo local and in its JSON backup', async ({ page }) => {
  const remoteRequests: string[] = [];
  page.on('request', (request) => {
    if (new URL(request.url()).origin !== 'http://127.0.0.1:4173') remoteRequests.push(request.url());
  });

  await page.goto('/app');
  await page.getByRole('button', { name: 'Add a chore' }).click();
  await page.getByLabel('Chore name').fill('Photograph the water meter');
  await page.getByLabel('Due every').fill('91');
  await page.getByRole('button', { name: 'Save chore' }).click();
  const chore = page.locator('.chore-card').filter({ hasText: 'Photograph the water meter' });
  await chore.getByRole('button', { name: 'Add note or photo' }).click();
  await page.getByLabel('Note optional').fill('Reading recorded before the utility visit.');
  await page.getByLabel('Photo optional').setInputFiles({
    name: 'water-meter.png',
    mimeType: 'image/png',
    buffer: Buffer.from(PHOTO_BASE64, 'base64')
  });
  await page.getByLabel('Anyone shown in this photo agreed to store it here.').check();
  await page.getByRole('button', { name: 'Mark done with proof' }).click();
  await expect(page.locator('.day-history')).toContainText('Reading recorded before the utility visit.');
  await expect(page.getByRole('img', { name: 'Photo saved with this completion' })).toBeVisible();

  await page.reload();
  await expect(page.locator('.day-history')).toContainText('Reading recorded before the utility visit.');
  const backup = await exportJson(page);
  const savedChore = backup.chores.find((item) => item.name === 'Photograph the water meter');
  expect(savedChore).toBeDefined();
  expect(backup.completions).toContainEqual(expect.objectContaining({
    choreId: savedChore!.id,
    note: 'Reading recorded before the utility visit.',
    photo: PHOTO_DATA_URL
  }));
  expect(remoteRequests).toEqual([]);
});

test('@claim:archive-retention keeps an archived chore and all of its history in JSON', async ({ page }) => {
  await page.goto('/app');
  await page.getByRole('button', { name: 'Add a chore' }).click();
  await page.getByLabel('Chore name').fill('Archive the pantry shelf record');
  await page.getByLabel('Due every').fill('14');
  await page.getByRole('button', { name: 'Save chore' }).click();
  const chore = page.locator('.chore-card').filter({ hasText: 'Archive the pantry shelf record' });

  await chore.getByRole('button', { name: 'Mark done' }).click();
  await expect(page.locator('.day-history')).toContainText('Archive the pantry shelf record');
  await chore.getByRole('button', { name: 'Mark done' }).click();
  await expect(page.locator('.day-history')).toContainText('Archive the pantry shelf record');

  page.once('dialog', (dialog) => dialog.accept());
  await chore.getByRole('button', { name: 'Archive' }).click();
  await expect(page.getByRole('heading', { name: 'Archive the pantry shelf record' })).toHaveCount(0);

  const backup = await exportJson(page);
  const archived = backup.chores.find((item) => item.name === 'Archive the pantry shelf record');
  expect(archived).toMatchObject({ archived: true, intervalDays: 14 });
  const history = backup.completions.filter((item) => item.choreId === archived!.id);
  expect(history).toHaveLength(2);
  expect(new Set(history.map((item) => item.id)).size).toBe(2);
});

test('@claim:site-data-deletion clears the persisted local calendar', async ({ page }) => {
  await page.goto('/app');
  await page.getByRole('button', { name: 'Add a chore' }).click();
  await page.getByLabel('Chore name').fill('Clear this site-data record');
  await page.getByRole('button', { name: 'Save chore' }).click();
  const chore = page.locator('.chore-card').filter({ hasText: 'Clear this site-data record' });
  await chore.getByRole('button', { name: 'Mark done' }).click();
  await expect(page.locator('.day-history')).toContainText('Clear this site-data record');
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Clear this site-data record' })).toBeVisible();

  const cdp = await page.context().newCDPSession(page);
  await cdp.send('Storage.clearDataForOrigin', { origin: 'http://127.0.0.1:4173', storageTypes: 'all' });
  await cdp.detach();
  await page.reload();

  await expect(page.getByRole('heading', { name: 'No chores yet' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Clear this site-data record' })).toHaveCount(0);
  const persistedRows = await page.evaluate(async () => {
    const db = await new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open('done-here:v1', 1);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    return new Promise<unknown[]>((resolve, reject) => {
      const request = db.transaction('records').objectStore('records').getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  });
  expect(persistedRows).toEqual([]);
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
