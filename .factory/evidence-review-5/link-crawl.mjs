import { chromium } from '@playwright/test';
import { writeFileSync } from 'node:fs';

const base = 'https://chore-proof-calendar.sociobot.in';
const routes = ['/', '/app', '/demo', '/privacy', '/terms', '/404', '/missing-route'];
const browser = await chromium.launch();
const context = await browser.newContext({ serviceWorkers: 'block' });
const page = await context.newPage();
const discovered = [];
try {
  for (const route of routes) {
    const response = await page.goto(base + route, { waitUntil: 'networkidle' });
    const links = await page.locator('a[href]').evaluateAll((nodes) => nodes.map((node) => ({ text: node.textContent?.trim(), href: node.href })));
    discovered.push({ route, documentStatus: response?.status(), title: await page.title(), links });
  }
} finally {
  await context.close();
  await browser.close();
}

const targets = [...new Set(discovered.flatMap((entry) => entry.links.map((link) => link.href.split('#')[0])).filter(Boolean))];
const checked = [];
for (const target of targets) {
  const response = await fetch(target, { redirect: 'manual' });
  checked.push({ target, status: response.status, location: response.headers.get('location') });
}
const expected404 = checked.filter((item) => ['/404', '/missing-route'].includes(new URL(item.target).pathname) && item.status === 404);
const failures = checked.filter((item) => item.status !== 200
  && !(item.target.includes('/checkout') && item.status === 303)
  && !expected404.includes(item));
const report = { discovered, checked, expected404, failures };
writeFileSync('/work/repo/.factory/evidence-review-5/link-crawl.json', `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify({ routeCount: discovered.length, linkCount: discovered.flatMap((entry) => entry.links).length, uniqueTargets: checked.length, failures }, null, 2));
if (failures.length) process.exitCode = 1;
