import './styles.css';
import { buildCsv, buildIcs, buildPdf, download } from './exports';
import { loadData, replaceData, saveData } from './storage';
import { photoLimit } from './policy';
import { SAMPLE_DATA, uid, type AppData, type Chore, type Completion } from './types';
import { dueInfo } from './dates';

const PRODUCT = 'chore-proof-calendar';
const LICENSE_KEY = `sb_license:${PRODUCT}`;
const VERDICT_KEY = `sb_license_verdict:${PRODUCT}`;
const root = document.querySelector<HTMLDivElement>('#app')!;
let data: AppData = { chores: [], completions: [] };
let demoData: AppData = structuredClone(SAMPLE_DATA);
let isDemo = false;
let realDataHydrated = false;
let storageError = '';
let importError = '';
let selectedDate = new Date().toISOString().slice(0, 10);
let calendarMonth = new Date(`${selectedDate}T12:00:00`);
let lastRemoved: Completion | null = null;
let updateReady = false;
let licenseActive = false;
let licenseNotice = '';

const esc = (value: unknown) => String(value ?? '').replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[char]!);
const fmtDate = (iso: string) => new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(new Date(iso));
const fmtDateTime = (iso: string) => new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(iso));
const activeData = () => isDemo ? demoData : data;
const isDemoRoute = () => location.pathname === '/demo' || new URLSearchParams(location.search).get('demo') === '1';

function localDate(iso: string) {
  const date = new Date(iso);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

async function persist() {
  if (isDemo) return;
  if (!realDataHydrated) {
    storageError = 'Your calendar is still loading. Reload the page before making changes.';
    throw new Error(storageError);
  }
  try { await saveData(data); storageError = ''; }
  catch (error) { storageError = error instanceof Error ? error.message : 'Your change was not saved. Reload and try again.'; throw error; }
}

async function hydrateRealData() {
  if (realDataHydrated) return;
  try {
    data = await loadData();
    realDataHydrated = true;
    storageError = '';
  } catch (error) {
    realDataHydrated = false;
    storageError = error instanceof Error ? error.message : 'Your calendar could not be read.';
  }
}

const navLink = (href: string, label: string) => `<a href="${href}" data-link>${label}</a>`;

function shell(content: string, title: string, description: string) {
  document.title = title;
  document.querySelector<HTMLMetaElement>('meta[name="description"]')!.content = description;
  document.querySelector<HTMLLinkElement>('link[rel="canonical"]')!.href = `https://chore-proof-calendar.sociobot.in${location.pathname}`;
  root.innerHTML = `
    <a class="skip-link" href="#main">Skip to main content</a>
    <header class="site-header">
      <a class="wordmark" href="/" data-link aria-label="Done Here home"><span class="seal" aria-hidden="true">✓</span><span>Done Here</span></a>
      <nav aria-label="Main navigation">${navLink('/app', 'Calendar')}${navLink('/demo', 'Demo')}${navLink('/privacy', 'Privacy')}</nav>
    </header>
    ${isDemo ? `<aside class="demo-banner" aria-label="Demo mode"><strong>Demo — sample data, nothing is saved</strong><span><button class="text-button" id="reset-demo">Reset demo</button><a href="/app" data-link>Start for real</a></span></aside>` : ''}
    ${!navigator.onLine ? '<div class="offline-strip" role="status">Offline. Your calendar still works here.</div>' : ''}
    <main id="main" tabindex="-1">${content}</main>
    <div id="route-status" class="sr-only" aria-live="polite">${esc(title)}</div>
    <footer><div><span class="wordmark-small">Done Here</span><p>Visible chore history for shared homes.</p></div><div class="footer-links">${navLink('/privacy', 'Privacy')}${navLink('/terms', 'Terms')}<a href="https://hello-factory.sociobot.in" rel="external">Built by Param Factory <span class="sr-only">(external)</span></a><span>v1.0.3</span></div><p class="asset-note">Ceramic artwork generated for this product.</p></footer>
    <div class="toast-region" aria-live="polite" aria-atomic="true"></div>`;
  document.querySelector('#reset-demo')?.addEventListener('click', () => { demoData = structuredClone(SAMPLE_DATA); toast('Sample data reset.'); render(); });
}

function homePage() {
  const preview = SAMPLE_DATA.chores.slice(0, 3).map((chore) => {
    const last = SAMPLE_DATA.completions.filter((item) => item.choreId === chore.id).sort((a, b) => b.completedAt.localeCompare(a.completedAt))[0];
    return `<li><span class="mini-stamp" aria-hidden="true">✓</span><span><strong>${esc(chore.name)}</strong><small>Last done ${fmtDate(last.completedAt)}</small></span></li>`;
  }).join('');
  shell(`
    <section class="hero">
      <div class="hero-copy">
        <p class="eyebrow">A household record, kept here</p>
        <h1>See when each chore was done</h1>
        <p class="lede">For households that need a clear history, not another overdue badge.</p>
        <div class="hero-actions"><a class="button primary" href="/demo" data-link>Try it with sample data</a><span>See a filled calendar in one click.</span></div>
        <a class="quiet-action" href="/app" data-link>Create your first chore →</a>
        <ul class="plain-facts">
          <li>Works after the first visit without internet.</li>
          <li>Chore records stay in this browser.</li>
          <li>$12 once raises photo storage from 5 to 500. The calendar is free.</li>
        </ul>
      </div>
      <figure class="hero-art"><picture><source media="(max-width: 700px)" srcset="/assets/hero-ceramics-960.webp"><img src="/assets/hero-ceramics-1440.webp" width="1440" height="960" fetchpriority="high" alt="Five handmade ceramic tiles form a weekly record with one teal completion mark."></picture><figcaption>Each completion leaves a dated mark you can return to.</figcaption></figure>
    </section>
    <section class="preview-section" aria-labelledby="preview-title">
      <div><p class="eyebrow">Today’s shelf</p><h2 id="preview-title">Last done stays visible</h2><p>Each chore shows its latest completion and next due date.</p></div>
      <ol class="preview-list">${preview}</ol>
    </section>
    <section class="steps" aria-labelledby="how-title"><p class="eyebrow">Three small moves</p><h2 id="how-title">How the record works</h2><ol><li><span>01</span><h3>Name the chore</h3><p>Choose how many days pass before it is due again.</p></li><li><span>02</span><h3>Mark it done</h3><p>Save the time in one tap. Add a note or photo when useful.</p></li><li><span>03</span><h3>Read the history</h3><p>Use the calendar or export the record as ICS, PDF, CSV, or JSON.</p></li></ol></section>
    <section class="boundaries"><div><p class="eyebrow">A calmer boundary</p><h2>Proof without household scoring</h2></div><div><p>Done Here does not rank people, assign points, or watch children.</p><p>It records the chore, time, note, and optional photo you choose.</p></div></section>
    ${paidSection()}
  `, 'Done Here — See when each chore was done', 'Record recurring household chores with notes, photos, due dates, and a compact calendar history. No account needed.');
  bindPaid();
}

function paidSection() {
  const purchase = licenseActive
    ? '<span class="license-good">Household Pack active</span>'
    : `<a class="button secondary" href="https://api.sociobot.in/api/v1/products/${PRODUCT}/checkout">Buy Household Pack — $12</a>`;
  const restore = isDemo
    ? '<a class="text-button" href="/app" data-link>Restore a license in your calendar</a>'
    : '<button class="text-button" id="show-license">Have a license? Paste it</button><form id="license-form" class="license-form" hidden><label for="license">License</label><div><input id="license" name="license" autocomplete="off" required><button class="button small" type="submit">Verify license</button></div><p class="form-help">Verification sends only this token to Sociobot.</p></form><p id="license-status" role="status"></p>';
  return `<section class="paid" aria-labelledby="paid-title"><div><p class="eyebrow">Household Pack</p><h2 id="paid-title">Keep up to 500 photo proofs</h2><p>Pay $12 once to store up to 500 photos. Chores, notes, and every export stay free.</p></div><div class="paid-actions">${purchase}${licenseNotice ? `<p class="license-notice" role="status">${esc(licenseNotice)}</p>` : ''}${restore}</div></section>`;
}

function appPage() {
  if (!isDemo && !realDataHydrated) {
    shell(`
      <section class="not-found">
        <span class="empty-seal" aria-hidden="true">!</span>
        <p class="eyebrow">Local storage unavailable</p>
        <h1>Your calendar could not open</h1>
        <div class="error-panel" role="alert"><p>${esc(storageError || 'Your calendar could not be read. Reload the page and try again.')}</p></div>
        <button class="button primary" id="retry-calendar">Retry opening calendar</button>
      </section>
    `, 'Calendar unavailable — Done Here', 'Retry opening your local Done Here calendar.');
    document.querySelector('#retry-calendar')?.addEventListener('click', () => { void navigate(); });
    return;
  }
  const d = activeData();
  const sorted = [...d.chores].filter((c) => !c.archived).sort((a, b) => dueInfo(a, d.completions).due.getTime() - dueInfo(b, d.completions).due.getTime());
  shell(`
    <section class="app-head"><div><p class="eyebrow">Your household shelf</p><h1>Keep a record of every chore</h1><p>Mark work once. The history stays ready when memory gets fuzzy.</p></div><button class="button primary" id="add-chore">Add a chore</button></section>
    ${storageError ? `<div class="error-panel" role="alert"><strong>Your calendar could not open.</strong><p>${esc(storageError)}</p></div>` : ''}
    ${updateReady ? '<div class="update-panel" role="status">A new version is ready. <button class="text-button" id="update-app">Update now</button></div>' : ''}
    <section aria-labelledby="chores-title" class="chore-section"><div class="section-heading"><div><p class="eyebrow">Next marks</p><h2 id="chores-title">Recurring chores</h2></div><span>${sorted.length} active</span></div>
      ${sorted.length ? `<ul class="chore-list">${sorted.map(choreCard).join('')}</ul>` : `<div class="empty-state"><span class="empty-seal" aria-hidden="true">○</span><h3>No chores yet</h3><p>Your recurring chores will appear here with last-done and next-due dates.</p><button class="button primary" id="empty-add">Add your first chore</button></div>`}
    </section>
    ${calendarSection()}
    <section class="export-section" aria-labelledby="export-title"><div><p class="eyebrow">Take your record</p><h2 id="export-title">Export your history</h2><p>Calendar, document, spreadsheet, and full backup formats are included.</p></div><div class="export-actions">${importError ? `<div class="import-error" role="alert"><strong>Backup was not imported.</strong><p>${esc(importError)}</p></div>` : ''}<button class="button secondary" data-export="ics">Export ICS</button><button class="button secondary" data-export="pdf">Export PDF</button><button class="button secondary" data-export="csv">Export CSV</button><button class="button secondary" data-export="json">Export JSON</button><label class="button ghost" for="import-json">Import JSON</label><input class="sr-only" id="import-json" type="file" accept="application/json"></div></section>
    ${paidSection()}
    <dialog id="chore-dialog"><form method="dialog" id="chore-form"><div class="dialog-head"><div><p class="eyebrow">Recurring chore</p><h2>Add a chore</h2></div><button class="icon-button" value="cancel" aria-label="Close dialog">×</button></div><label for="chore-name">Chore name</label><input id="chore-name" name="name" maxlength="80" required><label for="chore-days">Due every</label><div class="number-field"><input id="chore-days" name="days" type="number" min="1" max="365" value="7" required><span>days</span></div><p class="form-error" id="chore-error" role="alert"></p><div class="dialog-actions"><button class="button ghost" value="cancel">Cancel</button><button class="button primary" value="default" id="save-chore">Save chore</button></div></form></dialog>
    <dialog id="proof-dialog"><form method="dialog" id="proof-form"><div class="dialog-head"><div><p class="eyebrow">Completion proof</p><h2>Add a note or photo</h2></div><button class="icon-button" value="cancel" aria-label="Close dialog">×</button></div><input type="hidden" name="choreId" id="proof-chore"><label for="proof-note">Note <span>optional</span></label><textarea id="proof-note" name="note" maxlength="300" rows="3"></textarea><label for="proof-photo">Photo <span>optional</span></label><input id="proof-photo" name="photo" type="file" accept="image/jpeg,image/png,image/webp"><p class="form-help">Photos stay in this browser and appear in exported JSON.</p><label class="check-row"><input id="photo-consent" type="checkbox"><span>Anyone shown in this photo agreed to store it here.</span></label><p class="form-error" id="proof-error" role="alert"></p><div class="dialog-actions"><button class="button ghost" value="cancel">Cancel</button><button class="button primary" value="default" id="save-proof">Mark done with proof</button></div></form></dialog>
  `, isDemo ? 'Demo — Done Here' : 'Calendar — Done Here', 'Mark recurring chores done and see their completion history in a local calendar.');
  bindApp(); bindPaid();
}

function choreCard(chore: Chore) {
  const info = dueInfo(chore, activeData().completions);
  const state = info.diff < 0 ? 'overdue' : info.diff === 0 ? 'today' : 'upcoming';
  return `<li class="chore-card"><div class="chore-main"><span class="due-stamp ${state}">${esc(info.label)}</span><h3>${esc(chore.name)}</h3><p>${info.last ? `Last done <time datetime="${esc(info.last.completedAt)}">${fmtDateTime(info.last.completedAt)}</time>` : 'No completion yet'}</p><p>Every ${chore.intervalDays} day${chore.intervalDays === 1 ? '' : 's'} · next ${fmtDate(info.due.toISOString())}</p></div><div class="chore-actions"><button class="round-action" data-done="${chore.id}"><span aria-hidden="true">✓</span>Mark done</button><button class="text-button" data-proof="${chore.id}">Add note or photo</button><button class="text-button danger" data-archive="${chore.id}">Archive</button></div></li>`;
}

function calendarSection() {
  const year = calendarMonth.getFullYear();
  const month = calendarMonth.getMonth();
  const first = new Date(year, month, 1);
  const count = new Date(year, month + 1, 0).getDate();
  const offset = (first.getDay() + 6) % 7;
  const cells: string[] = Array(offset).fill('<span class="calendar-pad" aria-hidden="true"></span>');
  const eventDays = new Map<string, number>();
  activeData().completions.forEach((item) => eventDays.set(localDate(item.completedAt), (eventDays.get(localDate(item.completedAt)) ?? 0) + 1));
  for (let day = 1; day <= count; day++) {
    const key = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const events = eventDays.get(key) ?? 0;
    cells.push(`<button class="calendar-day ${key === selectedDate ? 'selected' : ''} ${events ? 'has-events' : ''}" data-date="${key}" aria-pressed="${key === selectedDate}" aria-label="${fmtDate(`${key}T12:00:00`)}${events ? `, ${events} completion${events === 1 ? '' : 's'}` : ''}"><span>${day}</span>${events ? `<i aria-hidden="true">${events}</i>` : ''}</button>`);
  }
  const selected = activeData().completions.filter((item) => localDate(item.completedAt) === selectedDate).sort((a, b) => b.completedAt.localeCompare(a.completedAt));
  const names = new Map(activeData().chores.map((chore) => [chore.id, chore.name]));
  return `<section class="calendar-section" aria-labelledby="calendar-title"><div class="calendar-panel"><div class="calendar-head"><div><p class="eyebrow">Pressed in time</p><h2 id="calendar-title">Completion calendar</h2></div><div><button class="icon-button" id="prev-month" aria-label="Previous month">←</button><strong>${calendarMonth.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</strong><button class="icon-button" id="next-month" aria-label="Next month">→</button></div></div><div class="calendar-scroll"><div class="weekdays" aria-hidden="true"><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span></div><div class="calendar-grid" aria-label="Completion calendar">${cells.join('')}</div></div><p class="calendar-help">Use arrow keys to move between days.</p></div><aside class="day-history" aria-labelledby="day-title"><p class="eyebrow">Selected day</p><h3 id="day-title">${fmtDate(`${selectedDate}T12:00:00`)}</h3>${selected.length ? `<ol>${selected.map((item) => `<li><span class="mini-stamp" aria-hidden="true">✓</span><div><strong>${esc(names.get(item.choreId) ?? 'Archived chore')}</strong><time datetime="${esc(item.completedAt)}">${new Date(item.completedAt).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}</time>${item.note ? `<p>${esc(item.note)}</p>` : ''}${item.photo ? `<img src="${esc(item.photo)}" alt="Photo saved with this completion" loading="lazy">` : ''}<button class="text-button danger" data-remove="${item.id}">Remove completion</button></div></li>`).join('')}</ol>` : '<div class="empty-day"><span aria-hidden="true">○</span><p>No completions on this day. Mark a chore done to place it here.</p></div>'}</aside></section>`;
}

function legalPage(kind: 'privacy' | 'terms') {
  const privacy = kind === 'privacy';
  shell(`<article class="legal"><p class="eyebrow">${privacy ? 'Your data' : 'The agreement'}</p><h1>${privacy ? 'Your chore data stays with you' : 'Terms for using Done Here'}</h1>${privacy ? `<h2>What is stored</h2><p>Chores, completions, notes, and photos are stored in this browser. You do not create an account to use Done Here.</p><h2>What can leave</h2><p>License verification sends your license token to Sociobot. Checkout opens Sociobot, the merchant of record.</p><p>Exports leave only when you download or share them. Removing site data removes the local calendar.</p><h2>Demo data</h2><p>The demo uses a separate memory-only copy. It does not read or write your real calendar or license.</p>` : `<h2>Use at your own discretion</h2><p>Done Here records household chores on your device. It does not guarantee that work was completed or that a photo is accurate.</p><h2>Purchases</h2><p>The $12 Household Pack is a one-time purchase. Sociobot and Dodo handle checkout and refunds. A refunded license stops working.</p><h2>Your responsibilities</h2><p>Get consent before saving photos of other people. Keep exports private when they contain household details.</p><h2>Warranty</h2><p>The software is provided as is under the MIT License, without warranty.</p>`}<p class="legal-date">Effective 28 August 2026</p></article>`, `${privacy ? 'Privacy' : 'Terms'} — Done Here`, privacy ? 'How Done Here stores chores, completion notes, photos, and licenses.' : 'Terms for using Done Here and its one-time Household Pack.');
}

function notFoundPage() {
  shell(`<section class="not-found"><span class="empty-seal" aria-hidden="true">?</span><p class="eyebrow">No mark here</p><h1>This page is not on the calendar</h1><p>The address may be old or mistyped.</p><a class="button primary" href="/" data-link>Return home</a></section>`, 'Page not found — Done Here', 'This page could not be found. Return to Done Here.');
}

function bindApp() {
  const openChore = () => (document.querySelector<HTMLDialogElement>('#chore-dialog')?.showModal());
  document.querySelector('#add-chore')?.addEventListener('click', openChore);
  document.querySelector('#empty-add')?.addEventListener('click', openChore);
  document.querySelector('#save-chore')?.addEventListener('click', async (event) => {
    event.preventDefault();
    const form = document.querySelector<HTMLFormElement>('#chore-form')!;
    if (!form.reportValidity()) return;
    const formData = new FormData(form);
    const chore: Chore = { id: uid(), name: String(formData.get('name')).trim(), intervalDays: Number(formData.get('days')), createdAt: new Date().toISOString() };
    if (!chore.name) return;
    activeData().chores.push(chore);
    try { await persist(); (document.querySelector<HTMLDialogElement>('#chore-dialog'))?.close(); toast(`${chore.name} added.`); render(); }
    catch { document.querySelector('#chore-error')!.textContent = storageError; }
  });
  document.querySelectorAll<HTMLButtonElement>('[data-done]').forEach((button) => button.addEventListener('click', () => markDone(button.dataset.done!)));
  document.querySelectorAll<HTMLButtonElement>('[data-proof]').forEach((button) => button.addEventListener('click', () => { (document.querySelector<HTMLInputElement>('#proof-chore')!).value = button.dataset.proof!; document.querySelector<HTMLDialogElement>('#proof-dialog')!.showModal(); }));
  document.querySelectorAll<HTMLButtonElement>('[data-archive]').forEach((button) => button.addEventListener('click', async () => {
    const chore = activeData().chores.find((item) => item.id === button.dataset.archive);
    if (chore && confirm(`Archive “${chore.name}”? Its completion history will remain in exports.`)) { chore.archived = true; await persist(); toast(`${chore.name} archived.`); render(); }
  }));
  document.querySelector('#save-proof')?.addEventListener('click', saveProof);
  document.querySelectorAll<HTMLButtonElement>('[data-date]').forEach((button) => button.addEventListener('click', () => { selectedDate = button.dataset.date!; render(); }));
  document.querySelector('#prev-month')?.addEventListener('click', () => { calendarMonth = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1, 1); render(); });
  document.querySelector('#next-month')?.addEventListener('click', () => { calendarMonth = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 1); render(); });
  const days = [...document.querySelectorAll<HTMLButtonElement>('[data-date]')];
  days.forEach((day, index) => day.addEventListener('keydown', (event) => {
    const delta = event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : event.key === 'ArrowDown' ? 7 : event.key === 'ArrowUp' ? -7 : 0;
    if (delta && days[index + delta]) { event.preventDefault(); days[index + delta].focus(); }
  }));
  document.querySelectorAll<HTMLButtonElement>('[data-remove]').forEach((button) => button.addEventListener('click', async () => {
    const item = activeData().completions.find((row) => row.id === button.dataset.remove);
    if (item && confirm('Remove this completion from the history?')) { lastRemoved = item; activeData().completions = activeData().completions.filter((row) => row.id !== item.id); await persist(); render(); toast('Completion removed.', 'Undo', async () => { if (lastRemoved) { activeData().completions.push(lastRemoved); lastRemoved = null; await persist(); render(); } }); }
  }));
  document.querySelectorAll<HTMLButtonElement>('[data-export]').forEach((button) => button.addEventListener('click', () => exportData(button.dataset.export!)));
  document.querySelector<HTMLInputElement>('#import-json')?.addEventListener('change', importJson);
  document.querySelector('#update-app')?.addEventListener('click', () => location.reload());
}

async function markDone(choreId: string) {
  const chore = activeData().chores.find((item) => item.id === choreId);
  if (!chore) return;
  const item: Completion = { id: uid(), choreId, completedAt: new Date().toISOString() };
  activeData().completions.push(item);
  selectedDate = localDate(item.completedAt);
  calendarMonth = new Date(`${selectedDate}T12:00:00`);
  try { await persist(); render(); toast(`${chore.name} marked done.`, 'Undo', async () => { activeData().completions = activeData().completions.filter((row) => row.id !== item.id); await persist(); render(); }); }
  catch { render(); }
}

async function fileAsDataUrl(file: File): Promise<string> {
  const header = new Uint8Array(await file.slice(0, 12).arrayBuffer());
  const isJpeg = file.type === 'image/jpeg' && header[0] === 0xff && header[1] === 0xd8 && header[2] === 0xff;
  const isPng = file.type === 'image/png' && [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a].every((byte, index) => header[index] === byte);
  const isWebp = file.type === 'image/webp' && String.fromCharCode(...header.slice(0, 4)) === 'RIFF' && String.fromCharCode(...header.slice(8, 12)) === 'WEBP';
  if (!isJpeg && !isPng && !isWebp) throw new Error('This file is not a valid JPEG, PNG, or WebP photo. Choose a supported image.');
  if (file.size > 2_500_000) throw new Error('This photo is over 2.5 MB. Choose a smaller photo and try again.');
  return new Promise((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(String(reader.result)); reader.onerror = () => reject(new Error('This photo could not be read. Choose another file.')); reader.readAsDataURL(file); });
}

async function saveProof(event: Event) {
  event.preventDefault();
  const form = document.querySelector<HTMLFormElement>('#proof-form')!;
  const file = document.querySelector<HTMLInputElement>('#proof-photo')!.files?.[0];
  const consent = document.querySelector<HTMLInputElement>('#photo-consent')!;
  const error = document.querySelector('#proof-error')!;
  if (file && !consent.checked) { error.textContent = 'Confirm photo consent before saving this photo.'; return; }
  const photoCount = activeData().completions.filter((item) => item.photo).length;
  if (file && photoCount >= photoLimit(licenseActive) && !isDemo) { error.textContent = licenseActive ? 'The 500-photo limit is full. Export a backup, then remove older photos.' : 'The free photo limit is five. Buy or restore the Household Pack to add more.'; return; }
  try {
    const formData = new FormData(form);
    const item: Completion = { id: uid(), choreId: String(formData.get('choreId')), completedAt: new Date().toISOString(), note: String(formData.get('note') ?? '').trim(), photo: file ? await fileAsDataUrl(file) : undefined };
    activeData().completions.push(item); selectedDate = localDate(item.completedAt); calendarMonth = new Date(`${selectedDate}T12:00:00`); await persist(); document.querySelector<HTMLDialogElement>('#proof-dialog')!.close(); render(); toast('Completion saved with proof.');
  } catch (cause) { error.textContent = cause instanceof Error ? cause.message : 'The completion could not be saved. Try again.'; }
}

function exportData(kind: string) {
  const stamp = new Date().toISOString().slice(0, 10);
  if (kind === 'ics') download(`done-here-${stamp}.ics`, new Blob([buildIcs(activeData())], { type: 'text/calendar;charset=utf-8' }));
  if (kind === 'csv') download(`done-here-${stamp}.csv`, new Blob([buildCsv(activeData())], { type: 'text/csv;charset=utf-8' }));
  if (kind === 'json') download(`done-here-${stamp}.json`, new Blob([JSON.stringify(activeData(), null, 2)], { type: 'application/json' }));
  if (kind === 'pdf') download(`done-here-${stamp}.pdf`, new Blob([buildPdf(activeData())], { type: 'application/pdf' }));
  toast(`${kind.toUpperCase()} export ready.`);
}

async function importJson(event: Event) {
  if (isDemo) { toast('Demo imports are not saved. Start for real to import a backup.'); return; }
  const input = event.currentTarget as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;
  try {
    const parsed: unknown = JSON.parse(await file.text());
    // replaceData validates every record before it opens a write transaction.
    await replaceData(parsed);
    data = await loadData();
    importError = '';
    render();
    toast('Backup imported.');
  } catch (cause) {
    importError = cause instanceof Error ? cause.message : 'This file could not be imported. Choose a Done Here JSON backup.';
    // Keep the recovery message in the document instead of a short-lived toast.
    // A rejected backup must leave both the in-memory and IndexedDB calendars alone.
    render();
  }
}

function bindPaid() {
  if (isDemo) return;
  document.querySelector('#show-license')?.addEventListener('click', () => { const form = document.querySelector<HTMLFormElement>('#license-form')!; form.hidden = !form.hidden; if (!form.hidden) form.querySelector('input')?.focus(); });
  document.querySelector('#license-form')?.addEventListener('submit', async (event) => {
    event.preventDefault(); const token = String(new FormData(event.currentTarget as HTMLFormElement).get('license') ?? '').trim(); if (!token) return;
    localStorage.setItem(LICENSE_KEY, token); localStorage.removeItem(VERDICT_KEY); await verifyLicense(token, true);
  });
}

async function verifyLicense(token: string, report = false) {
  if (isDemo) return;
  const status = document.querySelector('#license-status');
  if (report && status) status.textContent = 'Checking this license…';
  try {
    const response = await fetch(`https://api.sociobot.in/api/v1/products/${PRODUCT}/verify?license=${encodeURIComponent(token)}`);
    const result = await response.json() as { valid: boolean; reason?: string };
    if (isDemo) return;
    licenseActive = result.valid;
    licenseNotice = !result.valid && ['expired', 'revoked'].includes(result.reason ?? '') ? 'This license is no longer active.' : '';
    localStorage.setItem(VERDICT_KEY, JSON.stringify({ valid: result.valid, reason: result.reason, checkedAt: Date.now() }));
    if (report && status) status.textContent = result.valid ? 'Household Pack is active.' : 'This license is not active. Check the token or buy a new license.';
    if (result.valid && report) setTimeout(render, 500);
    if (licenseNotice) render();
  } catch { if (report && status) status.textContent = 'The license service could not be reached. Check your connection and try again.'; }
}

async function initLicense() {
  if (isDemo) { licenseActive = false; return; }
  const url = new URL(location.href);
  const incoming = url.searchParams.get('license');
  if (incoming) { localStorage.setItem(LICENSE_KEY, incoming); localStorage.removeItem(VERDICT_KEY); url.searchParams.delete('license'); history.replaceState({}, '', url.pathname + url.search + url.hash); }
  const token = localStorage.getItem(LICENSE_KEY);
  const cached = JSON.parse(localStorage.getItem(VERDICT_KEY) || 'null') as { valid: boolean; reason?: string; checkedAt: number } | null;
  licenseActive = Boolean(cached?.valid);
  licenseNotice = !cached?.valid && ['expired', 'revoked'].includes(cached?.reason ?? '') ? 'This license is no longer active.' : '';
  if (token && (!cached || Date.now() - cached.checkedAt > 86_400_000) && !isDemo) void verifyLicense(token);
}

function toast(message: string, action?: string, callback?: () => void | Promise<void>, duration = 7_000) {
  const region = document.querySelector('.toast-region'); if (!region) return;
  region.innerHTML = `<div class="toast"><span>${esc(message)}</span>${action ? `<button class="text-button">${esc(action)}</button>` : ''}</div>`;
  if (action && callback) region.querySelector('button')?.addEventListener('click', () => { void callback(); region.innerHTML = ''; });
  if (duration > 0) setTimeout(() => { if (region.textContent?.includes(message)) region.innerHTML = ''; }, duration);
}

function render(focus = false) {
  if (location.pathname === '/') homePage();
  else if (location.pathname === '/app' || isDemo) appPage();
  else if (location.pathname === '/privacy') legalPage('privacy');
  else if (location.pathname === '/terms') legalPage('terms');
  else notFoundPage();
  bindNavigation();
  if (focus) { window.scrollTo(0, 0); requestAnimationFrame(() => { const heading = document.querySelector<HTMLElement>('h1'); heading?.setAttribute('tabindex', '-1'); heading?.focus({ preventScroll: true }); }); }
}

async function prepareRoute() {
  const nextIsDemo = isDemoRoute();
  if (nextIsDemo) {
    isDemo = true;
    licenseActive = false;
    licenseNotice = '';
    return;
  }

  const wasDemo = isDemo;
  // Keep the previous demo state active while IndexedDB is read. This makes
  // every demo exit read-only with respect to the real calendar until its
  // complete state is available in memory.
  await hydrateRealData();
  isDemo = false;
  if (wasDemo) await initLicense();
}

async function navigate(focus = false) {
  await prepareRoute();
  render(focus);
}

function bindNavigation() {
  document.querySelectorAll<HTMLAnchorElement>('a[data-link]').forEach((link) => link.addEventListener('click', (event) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault(); history.pushState({}, '', link.href); void navigate(true);
  }));
}

window.addEventListener('popstate', () => { void navigate(true); });
window.addEventListener('online', () => render());
window.addEventListener('offline', () => render());
async function boot() {
  if (new URLSearchParams(location.search).get('demo') === '1' && location.pathname === '/') history.replaceState({}, '', '/demo');
  isDemo = isDemoRoute();
  if (isDemo) {
    selectedDate = demoData.completions.map((item) => localDate(item.completedAt)).sort().at(-1) ?? selectedDate;
    calendarMonth = new Date(`${selectedDate}T12:00:00`);
  }
  await initLicense();
  if (!isDemo) await hydrateRealData();
  render();
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').then((registration) => {
      registration.addEventListener('updatefound', () => { const worker = registration.installing; worker?.addEventListener('statechange', () => { if (worker.state === 'installed' && navigator.serviceWorker.controller) { updateReady = true; render(); } }); });
    }).catch(() => { /* The page remains usable without install support. */ });
  }
}

void boot();
