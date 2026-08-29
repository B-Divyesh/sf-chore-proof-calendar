/* global process, console, window, document, getComputedStyle, navigator, caches, URL */
import { chromium } from '@playwright/test';
import axe from 'axe-core';
import { writeFileSync } from 'node:fs';

const base = process.argv[2] ?? 'http://127.0.0.1:4173';
const output = process.argv[3] ?? '.factory/browser-matrix.json';
const browser = await chromium.launch();
const report = { routes: [], keyboard: {}, privacy: {}, offline: {}, reducedMotion: {}, zoom: {} };

try {
  for (const viewport of [{ name: 'desktop', width: 1280, height: 720 }, { name: 'mobile', width: 390, height: 844 }]) {
    const context = await browser.newContext({ viewport });
    const page = await context.newPage();
    for (const route of ['/', '/app', '/demo', '/privacy', '/terms', '/404', '/missing-route']) {
      console.log(`Checking ${viewport.name} ${route}`);
      const errors = [];
      const onConsole = (message) => { if (message.type() === 'error' && !message.text().includes('404 (Not Found)')) errors.push(message.text()); };
      const onPageError = (error) => errors.push(String(error));
      page.on('console', onConsole);
      page.on('pageerror', onPageError);
      await page.goto(base + route, { waitUntil: 'networkidle' });
      await page.evaluate((source) => { (0, eval)(source); }, axe.source);
      const scan = await page.evaluate(async () => await window.axe.run(document));
      const metrics = await page.evaluate(() => ({
        title: document.title,
        lang: document.documentElement.lang,
        h1: document.querySelectorAll('h1').length,
        main: document.querySelectorAll('main').length,
        missingAlt: [...document.images].filter((image) => !image.hasAttribute('alt')).length,
        overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth
      }));
      report.routes.push({ viewport: viewport.name, route, errors, seriousCritical: scan.violations.filter((violation) => ['serious', 'critical'].includes(violation.impact)).map((violation) => violation.id), ...metrics });
      page.off('console', onConsole);
      page.off('pageerror', onPageError);
    }
    if (viewport.name === 'mobile') {
      await page.goto(base + '/demo');
      const targets = await page.locator('a[href], button, input:not(.sr-only):not([type="hidden"]), textarea, select, label.button[for]').evaluateAll((nodes) => nodes.filter((node) => {
        const style = getComputedStyle(node);
        const rect = node.getBoundingClientRect();
        return style.visibility !== 'hidden' && style.display !== 'none' && rect.width && rect.height;
      }).map((node) => {
        const rect = node.getBoundingClientRect();
        return { label: node.getAttribute('aria-label') || node.textContent?.trim(), width: rect.width, height: rect.height };
      }));
      report.mobileTargets = { count: targets.length, below44: targets.filter((target) => target.width < 44 || target.height < 44) };
    }
    await context.close();
  }

  {
    const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
    const page = await context.newPage();
    await page.goto(base + '/demo');
    await page.keyboard.press('Tab');
    const skipVisible = await page.getByRole('link', { name: 'Skip to main content' }).isVisible();
    await page.keyboard.press('Enter');
    await page.waitForFunction(() => document.activeElement?.tagName === 'H1');
    const skipFocus = await page.getByRole('heading', { level: 1 }).evaluate((node) => document.activeElement === node);
    await page.getByRole('button', { name: 'Add a chore' }).click();
    let dialogTrap = true;
    for (let index = 0; index < 8; index += 1) {
      await page.keyboard.press('Tab');
      if (await page.evaluate(() => document.activeElement !== document.body && !document.activeElement?.closest('dialog[open]'))) dialogTrap = false;
    }
    await page.keyboard.press('Escape');
    const dialogFocusReturn = await page.getByRole('button', { name: 'Add a chore' }).evaluate((node) => document.activeElement === node);
    const selected = page.locator('.calendar-day.selected');
    await selected.focus();
    await page.keyboard.press('ArrowLeft');
    const arrowMoved = await page.locator('.calendar-day:focus').count() === 1;
    const focusedDate = await page.locator('.calendar-day:focus').getAttribute('data-date');
    await page.keyboard.press('Enter');
    const enterSelected = await page.locator(`[data-date="${focusedDate}"]`).getAttribute('aria-pressed') === 'true';
    await page.getByRole('link', { name: 'Start for real' }).click();
    await page.getByRole('heading', { level: 1 }).waitFor();
    await page.waitForFunction(() => document.activeElement?.tagName === 'H1');
    const routeFocus = await page.getByRole('heading', { level: 1 }).evaluate((node) => document.activeElement === node);
    report.keyboard = { skipVisible, skipFocus, dialogTrap, dialogFocusReturn, arrowMoved, enterSelected, routeFocus };
    await context.close();
  }

  {
    const context = await browser.newContext({ acceptDownloads: true });
    const page = await context.newPage();
    const externalRequests = [];
    page.on('request', (request) => { if (new URL(request.url()).origin !== base) externalRequests.push(request.url()); });
    await page.goto(base + '/demo');
    await page.getByRole('button', { name: 'Mark done' }).first().click();
    const download = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Export JSON' }).click();
    await download;
    report.privacy = { externalRequests };
    await context.close();
  }

  {
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.goto(base + '/demo');
    await page.waitForFunction(() => Boolean(navigator.serviceWorker?.controller));
    await page.waitForFunction(async () => Boolean(await (await caches.open('done-here-v10')).match('/demo')));
    await context.setOffline(true);
    await page.reload({ waitUntil: 'domcontentloaded' });
    report.offline = {
      heading: await page.getByRole('heading', { level: 1 }).textContent(),
      statusVisible: await page.getByText('Offline. Your calendar still works here.').isVisible(),
      sampleChores: await page.locator('.chore-card').count()
    };
    await context.close();
  }

  {
    const context = await browser.newContext({ reducedMotion: 'reduce' });
    const page = await context.newPage();
    await page.goto(base + '/');
    report.reducedMotion = await page.locator('.button').first().evaluate((node) => ({ transitionDuration: getComputedStyle(node).transitionDuration, scrollBehavior: getComputedStyle(document.documentElement).scrollBehavior }));
    await context.close();
  }

  {
    const context = await browser.newContext({ viewport: { width: 640, height: 720 } });
    const page = await context.newPage();
    await page.goto(base + '/demo');
    report.zoom = {
      desktop200PercentEquivalent: true,
      overflow: await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth),
      addChoreVisible: await page.getByRole('button', { name: 'Add a chore' }).isVisible(),
      exportJsonVisible: await page.getByRole('button', { name: 'Export JSON' }).isVisible()
    };
    await context.close();
  }
} finally {
  await browser.close();
}

writeFileSync(output, JSON.stringify(report, null, 2));
const failures = [
  ...report.routes.filter((row) => row.errors.length || row.seriousCritical.length || row.lang !== 'en' || row.h1 !== 1 || row.main !== 1 || row.missingAlt || row.overflow > 0),
  ...(report.mobileTargets.below44.length ? [report.mobileTargets] : []),
  ...(!Object.values(report.keyboard).every(Boolean) ? [report.keyboard] : []),
  ...(report.privacy.externalRequests.length ? [report.privacy] : []),
  ...(!(report.offline.statusVisible && report.offline.sampleChores === 4) ? [report.offline] : []),
  ...(!(report.zoom.overflow === 0 && report.zoom.addChoreVisible && report.zoom.exportJsonVisible) ? [report.zoom] : [])
];
console.log(JSON.stringify({
  routeChecks: report.routes.length,
  axeSeriousCritical: report.routes.flatMap((row) => row.seriousCritical).length,
  consoleErrors: report.routes.flatMap((row) => row.errors).length,
  mobileTargets: report.mobileTargets,
  keyboard: report.keyboard,
  privacy: report.privacy,
  offline: report.offline,
  reducedMotion: report.reducedMotion,
  zoom: report.zoom,
  failures: failures.length
}, null, 2));
process.exitCode = failures.length ? 1 : 0;
