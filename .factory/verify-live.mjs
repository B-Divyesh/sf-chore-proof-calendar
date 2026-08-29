/* global process, console, Buffer, URL, fetch */
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';

const base = process.argv[2] ?? 'https://chore-proof-calendar.sociobot.in';
const output = process.argv[3] ?? '.factory/live-response-identity.json';
const hash = (body) => createHash('sha256').update(body).digest('hex');
const files = [
  ['index.html', '/index.html'],
  ['sw.js', '/sw.js'],
  ['manifest.webmanifest', '/manifest.webmanifest'],
  ['not-found.html', '/not-found.html'],
  ['assets/hero-ceramics-960.webp', '/assets/hero-ceramics-960.webp'],
  ['assets/hero-ceramics-1440.webp', '/assets/hero-ceramics-1440.webp'],
  ['assets/icon-192.png', '/assets/icon-192.png'],
  ['assets/icon-512.png', '/assets/icon-512.png']
];

const identity = [];
for (const [file, path] of files) {
  const local = readFileSync(`dist/${file}`);
  const response = await fetch(base + path, { cache: 'no-store' });
  const live = Buffer.from(await response.arrayBuffer());
  identity.push({ path, status: response.status, localSha256: hash(local), liveSha256: hash(live), matches: local.equals(live) });
}

const routes = [];
for (const path of ['/', '/app', '/demo', '/privacy', '/terms', '/robots.txt', '/sitemap.xml', '/missing-route']) {
  const response = await fetch(base + path, { redirect: 'manual', cache: 'no-store' });
  routes.push({ path, status: response.status });
}

const headerResponses = {};
for (const path of ['/demo', '/sw.js', '/manifest.webmanifest', '/assets/hero-ceramics-960.webp']) {
  const response = await fetch(base + path, { cache: 'no-store' });
  headerResponses[path] = Object.fromEntries([...response.headers].filter(([name]) => [
    'cache-control',
    'content-security-policy',
    'content-type',
    'permissions-policy',
    'referrer-policy',
    'strict-transport-security',
    'x-content-type-options'
  ].includes(name)));
}

const checkout = await fetch('https://api.sociobot.in/api/v1/products/chore-proof-calendar/checkout', { redirect: 'manual' });
const verification = await fetch('https://api.sociobot.in/api/v1/products/chore-proof-calendar/verify?license=repair-7-invalid-token', {
  headers: { Origin: base }
});
const report = {
  base,
  identity,
  routes,
  headers: headerResponses,
  billing: {
    checkout: { status: checkout.status, locationOrigin: new URL(checkout.headers.get('location')).origin },
    verification: {
      status: verification.status,
      cacheControl: verification.headers.get('cache-control'),
      allowOrigin: verification.headers.get('access-control-allow-origin'),
      body: await verification.json()
    }
  }
};

writeFileSync(output, JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
const shellHeaders = report.headers['/demo'];
const failed = identity.some((entry) => entry.status !== 200 || !entry.matches)
  || routes.some((entry) => entry.status !== (entry.path === '/missing-route' ? 404 : 200))
  || !shellHeaders['content-security-policy']?.includes("frame-ancestors 'none'")
  || shellHeaders['x-content-type-options'] !== 'nosniff'
  || !shellHeaders['strict-transport-security']
  || !report.headers['/sw.js']['cache-control']?.includes('no-store')
  || !report.headers['/assets/hero-ceramics-960.webp']['cache-control']?.includes('immutable')
  || report.billing.checkout.status !== 303
  || report.billing.checkout.locationOrigin !== 'https://checkout.dodopayments.com'
  || report.billing.verification.status !== 200
  || report.billing.verification.cacheControl !== 'no-store'
  || report.billing.verification.allowOrigin !== base;
process.exitCode = failed ? 1 : 0;
