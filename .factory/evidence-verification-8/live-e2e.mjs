/* global Buffer, URL, console */
import { chromium } from '@playwright/test';
import { writeFileSync } from 'node:fs';

const base = 'https://chore-proof-calendar.sociobot.in';
const browser = await chromium.launch();
const context = await browser.newContext({ acceptDownloads: true, viewport: { width: 1280, height: 720 } });
const page = await context.newPage();
const requests = [];
const errors = [];
page.on('request', (request) => requests.push({ method: request.method(), type: request.resourceType(), url: request.url() }));
page.on('console', (message) => { if (message.type() === 'error') errors.push(`console: ${message.text()}`); });
page.on('pageerror', (error) => errors.push(`page: ${error.message}`));

const check = (condition, message) => { if (!condition) throw new Error(message); };
const downloadBody = async (label) => {
  const pending = page.waitForEvent('download');
  await page.getByRole('button', { name: label }).click();
  const download = await pending;
  const chunks = [];
  for await (const chunk of await download.createReadStream()) chunks.push(Buffer.from(chunk));
  return { name: download.suggestedFilename(), body: Buffer.concat(chunks) };
};

const report = { normal: {}, boundaries: {}, recovery: {}, exports: {}, archive: {}, privacy: {}, errors };
try {
  await page.goto(`${base}/app`, { waitUntil: 'networkidle' });
  check(await page.getByText('No chores yet').isVisible(), 'Fresh real calendar did not show its empty state');

  await page.getByRole('button', { name: 'Add a chore' }).click();
  const name = page.getByLabel('Chore name');
  const days = page.getByLabel('Due every');
  await name.fill('QA cooker hood filter');
  await days.fill('0');
  await page.getByRole('button', { name: 'Save chore' }).click();
  const underflow = await days.evaluate((input) => input.validity.rangeUnderflow);
  await days.fill('366');
  await page.getByRole('button', { name: 'Save chore' }).click();
  const overflow = await days.evaluate((input) => input.validity.rangeOverflow);
  await days.fill('21');
  await page.getByRole('button', { name: 'Save chore' }).click();
  const card = page.locator('.chore-card').filter({ hasText: 'QA cooker hood filter' });
  await card.waitFor();
  report.boundaries = { recurrence0Rejected: underflow, recurrence366Rejected: overflow, recurrence21Accepted: (await card.textContent()).includes('Every 21 days') };

  await card.getByRole('button', { name: 'Mark done' }).click();
  await page.locator('.day-history').getByText('QA cooker hood filter').waitFor();
  const firstHistoryCount = await page.locator('.day-history li').count();
  await page.reload({ waitUntil: 'networkidle' });
  const persisted = await page.getByRole('heading', { name: 'QA cooker hood filter' }).isVisible();
  report.normal = { oneTapHistoryCount: firstHistoryCount, persistedAfterReload: persisted, cardText: await page.locator('.chore-card').filter({ hasText: 'QA cooker hood filter' }).textContent() };

  const persistedCard = page.locator('.chore-card').filter({ hasText: 'QA cooker hood filter' });
  await persistedCard.getByRole('button', { name: 'Add note or photo' }).click();
  await page.getByLabel('Note optional').fill('Degreased and left to dry.');
  const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=', 'base64');
  await page.getByLabel('Photo optional').setInputFiles({ name: 'proof.png', mimeType: 'image/png', buffer: png });
  await page.getByRole('button', { name: 'Mark done with proof' }).click();
  const consentError = await page.getByText('Confirm photo consent before saving this photo.').isVisible();
  await page.getByLabel('Anyone shown in this photo agreed to store it here.').check();
  await page.getByRole('button', { name: 'Mark done with proof' }).click();
  await page.locator('.day-history').getByText('Degreased and left to dry.').waitFor();
  const savedPhoto = page.locator('.day-history').getByRole('img', { name: 'Photo saved with this completion' });
  await savedPhoto.waitFor({ state: 'attached' });
  await savedPhoto.scrollIntoViewIfNeeded();
  await savedPhoto.waitFor({ state: 'visible' });
  const photoVisible = await savedPhoto.isVisible();

  await persistedCard.getByRole('button', { name: 'Add note or photo' }).click();
  await page.getByLabel('Photo optional').setInputFiles({ name: 'fake.png', mimeType: 'image/png', buffer: Buffer.from('not a png') });
  await page.getByLabel('Anyone shown in this photo agreed to store it here.').check();
  await page.getByRole('button', { name: 'Mark done with proof' }).click();
  const invalidMessage = page.getByText('This file is not a valid JPEG, PNG, or WebP photo. Choose a supported image.');
  await invalidMessage.waitFor({ state: 'visible' });
  const invalidFileError = await invalidMessage.isVisible();
  const dialogStayedOpen = await page.locator('#proof-dialog').getAttribute('open') === '';
  await page.getByRole('button', { name: 'Cancel' }).click();
  report.recovery = { consentError, photoVisible, invalidFileError, dialogStayedOpen };

  const ics = await downloadBody('Export ICS');
  const pdf = await downloadBody('Export PDF');
  const csv = await downloadBody('Export CSV');
  const json = await downloadBody('Export JSON');
  const backup = JSON.parse(json.body.toString());
  report.exports = {
    names: [ics.name, pdf.name, csv.name, json.name],
    icsUtcEvents: (ics.body.toString().match(/DTSTART:\d{8}T\d{6}Z/g) ?? []).length,
    pdfHeader: pdf.body.subarray(0, 5).toString(),
    csvRows: csv.body.toString().trim().split('\n').length,
    jsonChores: backup.chores.length,
    jsonCompletions: backup.completions.length,
    notePreserved: backup.completions.some((item) => item.note === 'Degreased and left to dry.'),
    photoPreserved: backup.completions.some((item) => typeof item.photo === 'string' && item.photo.startsWith('data:image/png'))
  };

  await page.getByLabel('Import JSON').setInputFiles({ name: 'broken.json', mimeType: 'application/json', buffer: Buffer.from('{"chores":[{"id":"broken"}],"completions":[]}') });
  const malformedAlert = await page.getByRole('alert').filter({ hasText: 'Backup was not imported.' }).textContent();
  const preservedAfterBadImport = await page.getByRole('heading', { name: 'QA cooker hood filter' }).isVisible();
  report.recovery.malformedImportAlert = malformedAlert;
  report.recovery.preservedAfterBadImport = preservedAfterBadImport;

  page.once('dialog', (dialog) => dialog.accept());
  const archiveCard = page.locator('.chore-card').filter({ hasText: 'QA cooker hood filter' });
  await archiveCard.getByRole('button', { name: 'Archive' }).click();
  await archiveCard.waitFor({ state: 'detached' });
  const archivedHidden = await archiveCard.count() === 0;
  const archivedJson = await downloadBody('Export JSON');
  const archivedBackup = JSON.parse(archivedJson.body.toString());
  report.archive = {
    archivedHidden,
    recordRetained: archivedBackup.chores.some((item) => item.name === 'QA cooker hood filter' && item.archived === true),
    completionsRetained: archivedBackup.completions.filter((item) => item.choreId === archivedBackup.chores.find((chore) => chore.name === 'QA cooker hood filter')?.id).length
  };

  const external = requests.filter((request) => new URL(request.url).origin !== base);
  report.privacy = { requestCount: requests.length, external, requests };
  check(Object.values(report.boundaries).every(Boolean), 'Recurrence boundary behavior failed');
  check(firstHistoryCount === 1 && persisted, 'Normal completion did not persist');
  check(consentError && photoVisible && invalidFileError && dialogStayedOpen, 'Proof error recovery failed');
  check(report.exports.icsUtcEvents === 2 && report.exports.pdfHeader === '%PDF-' && report.exports.csvRows === 3, 'Export structure failed');
  check(report.exports.jsonChores === 1 && report.exports.jsonCompletions === 2 && report.exports.notePreserved && report.exports.photoPreserved, 'JSON export lost records');
  check(malformedAlert?.includes('current calendar was not changed') && preservedAfterBadImport, 'Malformed import changed the calendar');
  check(report.archive.archivedHidden && report.archive.recordRetained && report.archive.completionsRetained === 2, 'Archive lost history');
  check(external.length === 0, 'Real calendar sent unexpected external requests');
} finally {
  writeFileSync('.factory/evidence-verification-8/live-e2e.json', JSON.stringify(report, null, 2));
  await context.close();
  await browser.close();
}

console.log(JSON.stringify({
  normal: report.normal,
  boundaries: report.boundaries,
  recovery: report.recovery,
  exports: report.exports,
  archive: report.archive,
  privacy: { requestCount: report.privacy.requestCount, external: report.privacy.external },
  errors
}, null, 2));
