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
