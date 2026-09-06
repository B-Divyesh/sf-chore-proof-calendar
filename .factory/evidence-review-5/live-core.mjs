/* global indexedDB */
import { chromium } from '@playwright/test';
import { writeFileSync } from 'node:fs';

const base = 'https://chore-proof-calendar.sociobot.in';
const output = '/work/repo/.factory/evidence-review-5/live-core.json';
const assert = (condition, message) => { if (!condition) throw new Error(message); };
const readDownload = async (download) => {
  const stream = await download.createReadStream();
  const chunks = [];
  for await (const chunk of stream) chunks.push(chunk);
  return Buffer.concat(chunks);
};
const rows = (page) => page.evaluate(async () => new Promise((resolve, reject) => {
  const open = indexedDB.open('done-here:v1', 1);
  open.onerror = () => reject(open.error);
  open.onsuccess = () => {
    const request = open.result.transaction('records').objectStore('records').getAll();
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  };
}));

const browser = await chromium.launch();
const context = await browser.newContext({ acceptDownloads: true, serviceWorkers: 'block' });
const page = await context.newPage();
const errors = [];
const requests = [];
page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
page.on('pageerror', (error) => errors.push(error.message));
page.on('request', (request) => requests.push(request.url()));
const report = {};

try {
  await page.clock.install({ time: new Date('2026-09-06T16:00:45.000Z') });
  await page.goto(`${base}/app`, { waitUntil: 'networkidle' });
  report.empty = {
    heading: await page.getByRole('heading', { level: 1 }).textContent(),
    message: await page.locator('.empty-state').textContent(),
    choreCount: await page.locator('.chore-card').count()
  };
  assert(report.empty.choreCount === 0, 'fresh real calendar was not empty');

  await page.getByRole('button', { name: 'Add a chore' }).click();
  const name = page.getByLabel('Chore name');
  const interval = page.getByLabel('Due every');
  await name.fill('');
  await page.getByRole('button', { name: 'Save chore' }).click();
  const emptyNameRejected = await name.evaluate((input) => input.validity.valueMissing);
  await name.fill('Daily sink wipe');
  await interval.fill('0');
  await page.getByRole('button', { name: 'Save chore' }).click();
  const zeroRejected = await interval.evaluate((input) => input.validity.rangeUnderflow);
  await interval.fill('366');
  await page.getByRole('button', { name: 'Save chore' }).click();
  const overRejected = await interval.evaluate((input) => input.validity.rangeOverflow);
  await interval.fill('1');
  await page.getByRole('button', { name: 'Save chore' }).click();

  const card = page.locator('.chore-card').filter({ hasText: 'Daily sink wipe' });
  const beforeDone = await card.textContent();
  assert(beforeDone.includes('Due today') && beforeDone.includes('next Sep 6, 2026'), 'due state before completion is wrong');
  await card.getByRole('button', { name: 'Mark done' }).click();
  await card.getByText(/Last done/).waitFor();
  const afterDone = await card.textContent();
  assert(afterDone.includes('Due in 1 day') && afterDone.includes('Last done Sep 6, 2026') && afterDone.includes('next Sep 7, 2026'), `due state after completion is wrong: ${afterDone}`);

  await card.getByRole('button', { name: 'Add note or photo' }).click();
  const photo = page.getByLabel('Photo optional');
  const consent = page.getByLabel('Anyone shown in this photo agreed to store it here.');
  await page.getByLabel('Note optional').fill('Filter rinsed and left to dry.');
  await photo.setInputFiles({ name: 'fake.png', mimeType: 'image/png', buffer: Buffer.from('not an image') });
  await page.getByRole('button', { name: 'Mark done with proof' }).click();
  await page.getByText('Confirm photo consent before saving this photo.').waitFor();
  const consentError = true;
  await consent.check();
  await page.getByRole('button', { name: 'Mark done with proof' }).click();
  await page.getByText('This file is not a valid JPEG, PNG, or WebP photo. Choose a supported image.').waitFor();
  const bytesError = true;
  const dialogStayedOpen = await page.locator('#proof-dialog').getAttribute('open') === '';
  await photo.setInputFiles({
    name: 'filter.png',
    mimeType: 'image/png',
    buffer: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=', 'base64')
  });
  await page.getByRole('button', { name: 'Mark done with proof' }).click();
  await page.locator('#proof-dialog').waitFor({ state: 'hidden' });
  const history = page.locator('.day-history');
  await history.getByRole('img', { name: 'Photo saved with this completion' }).waitFor();
  const noteVisible = await history.getByText('Filter rinsed and left to dry.').isVisible();
  const photoVisible = await history.getByRole('img', { name: 'Photo saved with this completion' }).isVisible();

  const downloads = {};
  for (const kind of ['ICS', 'PDF', 'CSV', 'JSON']) {
    const pending = page.waitForEvent('download');
    await page.getByRole('button', { name: `Export ${kind}` }).click();
    const completed = await pending;
    downloads[kind] = { name: completed.suggestedFilename(), body: await readDownload(completed) };
  }
  const json = JSON.parse(downloads.JSON.body.toString());
  const ics = downloads.ICS.body.toString();
  const csv = downloads.CSV.body.toString();
  report.exports = {
    icsEvents: (ics.match(/BEGIN:VEVENT/g) ?? []).length,
    icsUtcEvents: (ics.match(/DTSTART:\d{8}T\d{6}Z/g) ?? []).length,
    pdfHeader: downloads.PDF.body.subarray(0, 5).toString(),
    pdfTerminator: downloads.PDF.body.toString().trimEnd().endsWith('%%EOF'),
    csvLines: csv.trim().split('\n').length,
    jsonChores: json.chores.length,
    jsonCompletions: json.completions.length,
    jsonHasNote: json.completions.some((item) => item.note === 'Filter rinsed and left to dry.'),
    jsonHasPhoto: json.completions.some((item) => String(item.photo ?? '').startsWith('data:image/png;base64,'))
  };

  const beforeMalformed = await rows(page);
  await page.getByLabel('Import JSON').setInputFiles({
    name: 'broken.json',
    mimeType: 'application/json',
    buffer: Buffer.from('{"chores":[{"id":"broken"}],"completions":[]}')
  });
  const recovery = await page.getByRole('alert').filter({ hasText: 'Backup was not imported.' }).textContent();
  const afterMalformed = await rows(page);
  await page.reload({ waitUntil: 'networkidle' });
  const persistsAfterReload = await page.getByRole('heading', { name: 'Daily sink wipe' }).isVisible();
  let archivePrompt = '';
  page.once('dialog', async (dialog) => { archivePrompt = dialog.message(); await dialog.accept(); });
  await page.locator('.chore-card').filter({ hasText: 'Daily sink wipe' }).getByRole('button', { name: 'Archive' }).click();
  await page.locator('.empty-state').waitFor();
  const archivedPending = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export JSON' }).click();
  const archived = JSON.parse((await readDownload(await archivedPending)).toString());

  report.boundaries = { emptyNameRejected, zeroRejected, overRejected, accepted: beforeDone.includes('Every 1 day') };
  report.due = { beforeDone, afterDone };
  report.proof = { consentError, bytesError, dialogStayedOpen, noteVisible, photoVisible };
  report.recovery = {
    message: recovery,
    dataUnchanged: JSON.stringify(beforeMalformed) === JSON.stringify(afterMalformed),
    persistsAfterReload
  };
  report.archive = {
    prompt: archivePrompt,
    activeChores: await page.locator('.chore-card').count(),
    exportedChores: archived.chores.length,
    exportedCompletions: archived.completions.length,
    archivedFlag: archived.chores[0]?.archived === true
  };
  report.privacy = {
    externalRequests: requests.filter((url) => new URL(url).origin !== base),
    localStorageKeys: await page.evaluate(() => Object.keys(localStorage)),
    sessionStorageKeys: await page.evaluate(() => Object.keys(sessionStorage))
  };
  report.errors = errors;

  const isolationContext = await browser.newContext({ serviceWorkers: 'block' });
  const isolationPage = await isolationContext.newPage();
  const isolationRequests = [];
  isolationPage.on('request', (request) => isolationRequests.push(request.url()));
  await isolationPage.goto(`${base}/app`);
  const seededLicense = {
    token: 'real-license-sentinel',
    verdict: JSON.stringify({ valid: true, checkedAt: 1788696000000 })
  };
  await isolationPage.evaluate(({ token, verdict }) => {
    localStorage.setItem('sb_license:chore-proof-calendar', token);
    localStorage.setItem('sb_license_verdict:chore-proof-calendar', verdict);
  }, seededLicense);
  isolationRequests.length = 0;
  await isolationPage.goto(`${base}/demo?license=incoming-demo-license`, { waitUntil: 'networkidle' });
  const licenseAfter = await isolationPage.evaluate(() => ({
    token: localStorage.getItem('sb_license:chore-proof-calendar'),
    verdict: localStorage.getItem('sb_license_verdict:chore-proof-calendar')
  }));
  report.demoLicenseIsolation = {
    storedValuesUnchanged: JSON.stringify(licenseAfter) === JSON.stringify(seededLicense),
    paidStateVisible: await isolationPage.getByText('Household Pack active').count(),
    verificationRequests: isolationRequests.filter((url) => url.startsWith('https://api.sociobot.in/')),
    bannerVisible: await isolationPage.getByText('Demo — sample data, nothing is saved').isVisible()
  };
  await isolationContext.close();

  const cdp = await context.newCDPSession(page);
  await cdp.send('Storage.clearDataForOrigin', { origin: base, storageTypes: 'all' });
  await page.reload({ waitUntil: 'networkidle' });
  report.siteDataDeletion = {
    storedRows: (await rows(page)).length,
    activeChores: await page.locator('.chore-card').count()
  };

  assert(Object.values(report.boundaries).every(Boolean), 'name or recurrence boundary failed');
  assert(Object.values(report.proof).every(Boolean), 'proof validation or valid recovery failed');
  assert(report.exports.icsEvents === 2 && report.exports.icsUtcEvents === 2, 'ICS event or timezone output failed');
  assert(report.exports.pdfHeader === '%PDF-' && report.exports.pdfTerminator, 'PDF output failed');
  assert(report.exports.csvLines === 3 && report.exports.jsonChores === 1 && report.exports.jsonCompletions === 2 && report.exports.jsonHasNote && report.exports.jsonHasPhoto, 'CSV or JSON output failed');
  assert(report.recovery.dataUnchanged && report.recovery.persistsAfterReload && recovery.includes('Your current calendar was not changed.'), 'malformed backup recovery failed');
  assert(report.archive.activeChores === 0 && report.archive.exportedChores === 1 && report.archive.exportedCompletions === 2 && report.archive.archivedFlag, 'archive history behavior failed');
  assert(report.privacy.externalRequests.length === 0 && errors.length === 0, 'unexpected request or browser error');
  assert(report.demoLicenseIsolation.storedValuesUnchanged && report.demoLicenseIsolation.paidStateVisible === 0 && report.demoLicenseIsolation.verificationRequests.length === 0 && report.demoLicenseIsolation.bannerVisible, 'demo license isolation failed');
  assert(report.siteDataDeletion.storedRows === 0 && report.siteDataDeletion.activeChores === 0, 'site-data deletion did not clear the calendar');
} finally {
  writeFileSync(output, `${JSON.stringify(report, null, 2)}\n`);
  await context.close();
  await browser.close();
}

console.log(JSON.stringify(report, null, 2));
