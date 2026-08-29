import { expect, test } from '@playwright/test';

test('a real calendar persists chores and completions', async ({ page }) => {
  await page.goto('/app');
  await page.getByRole('button', { name: 'Add a chore' }).click();
  await page.getByLabel('Chore name').fill('Clean the cooker hood');
  await page.getByLabel('Due every').fill('21');
  await page.getByRole('button', { name: 'Save chore' }).click();
  await expect(page.getByRole('heading', { name: 'Clean the cooker hood' })).toBeVisible();
  await page.reload();
  const card = page.locator('.chore-card').filter({ hasText: 'Clean the cooker hood' });
  await card.getByRole('button', { name: 'Mark done' }).click();
  await expect(page.locator('.day-history')).toContainText('Clean the cooker hood');
});

test('photo proof requires consent', async ({ page }) => {
  await page.goto('/demo');
  await page.getByRole('button', { name: 'Add note or photo' }).first().click();
  await page.getByLabel('Photo optional').setInputFiles({ name: 'sink.png', mimeType: 'image/png', buffer: Buffer.from('small-image') });
  await page.getByRole('button', { name: 'Mark done with proof' }).click();
  await expect(page.getByText('Confirm photo consent before saving this photo.')).toBeVisible();
});

test('photo proof rejects unsupported files and keeps the dialog open', async ({ page }) => {
  await page.goto('/demo');
  await page.getByRole('button', { name: 'Add note or photo' }).first().click();
  await page.getByLabel('Photo optional').setInputFiles({ name: 'not-an-image.txt', mimeType: 'text/plain', buffer: Buffer.from('not an image') });
  await page.getByLabel('Anyone shown in this photo agreed to store it here.').check();
  await page.getByRole('button', { name: 'Mark done with proof' }).click();
  await expect(page.getByText('This file is not a valid JPEG, PNG, or WebP photo. Choose a supported image.')).toBeVisible();
  await expect(page.locator('#proof-dialog')).toHaveAttribute('open', '');

  await page.getByLabel('Photo optional').setInputFiles({ name: 'fake.png', mimeType: 'image/png', buffer: Buffer.from('not an image') });
  await page.getByRole('button', { name: 'Mark done with proof' }).click();
  await expect(page.getByText('This file is not a valid JPEG, PNG, or WebP photo. Choose a supported image.')).toBeVisible();
});

test('@regression:malformed-backup rejects every record before preserving the current calendar', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/app');
  await page.getByRole('button', { name: 'Add a chore' }).click();
  await page.getByLabel('Chore name').fill('Keep this chore');
  await page.getByRole('button', { name: 'Save chore' }).click();

  await page.getByLabel('Import JSON').setInputFiles({
    name: 'broken.json',
    mimeType: 'application/json',
    buffer: Buffer.from('{"chores":[{"id":"broken"}],"completions":[]}')
  });
  const recovery = page.getByRole('alert').filter({ hasText: 'Backup was not imported.' });
  await expect(recovery).toContainText('This backup has an invalid chore or completion. Your current calendar was not changed.');
  await expect(page.getByRole('heading', { name: 'Keep this chore' })).toBeVisible();

  const rejectedExport = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export JSON' }).click();
  const rejectedStream = await (await rejectedExport).createReadStream();
  let rejectedBody = '';
  for await (const chunk of rejectedStream!) rejectedBody += chunk.toString();
  expect(JSON.parse(rejectedBody)).toMatchObject({ chores: [expect.objectContaining({ name: 'Keep this chore' })], completions: [] });

  await page.reload();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Keep a record of every chore');
  await expect(page.getByRole('heading', { name: 'Keep this chore' })).toBeVisible();
  expect(errors).toEqual([]);
});

test('@regression:mobile-target-size mobile navigation, demo, and footer controls meet the 44px target', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile', 'mobile measurement');
  await page.goto('/demo');
  const controls = page.locator('.site-header a, .demo-banner a, .demo-banner button, .footer-links a');
  let measured = 0;
  for (let index = 0; index < await controls.count(); index += 1) {
    const box = await controls.nth(index).boundingBox();
    if (!box) continue;
    measured += 1;
    const controlName = await controls.nth(index).textContent() ?? `control ${index}`;
    expect(box.width, `${controlName} width`).toBeGreaterThanOrEqual(44);
    expect(box.height, `${controlName} height`).toBeGreaterThanOrEqual(44);
  }
  expect(measured).toBeGreaterThan(0);
});

test('calendar arrow keys move focus between days', async ({ page }) => {
  await page.goto('/demo');
  const selected = page.locator('.calendar-day.selected');
  const date = await selected.getAttribute('data-date');
  await selected.focus();
  await page.keyboard.press('ArrowLeft');
  const previous = new Date(`${date}T12:00:00`);
  previous.setDate(previous.getDate() - 1);
  const expected = `${previous.getFullYear()}-${String(previous.getMonth() + 1).padStart(2, '0')}-${String(previous.getDate()).padStart(2, '0')}`;
  await expect(page.locator(`[data-date="${expected}"]`)).toBeFocused();
});

test('routes set one heading and route-specific titles', async ({ page }) => {
  for (const [path, title] of [['/privacy', 'Privacy — Done Here'], ['/terms', 'Terms — Done Here'], ['/missing-page', 'Page not found — Done Here']]) {
    await page.goto(path);
    await expect(page).toHaveTitle(title);
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.locator('main')).toHaveCount(1);
  }
});

test('the browser console stays clear on main routes', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
  page.on('pageerror', (error) => errors.push(error.message));
  for (const path of ['/', '/demo', '/privacy', '/terms', '/404']) await page.goto(path);
  expect(errors).toEqual([]);
});
