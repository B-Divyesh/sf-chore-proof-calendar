import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const readJson = (path: string) => JSON.parse(readFileSync(path, 'utf8'));
const readSources = (directory: string): string[] => readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
  const path = join(directory, entry.name);
  return entry.isDirectory() ? readSources(path) : entry.name.endsWith('.ts') ? [readFileSync(path, 'utf8')] : [];
});

describe('release configuration', () => {
  it('builds the production bundle before Playwright starts preview', () => {
    const packageJson = readJson('package.json');
    const playwrightConfig = readFileSync('playwright.config.ts', 'utf8');
    expect(packageJson.scripts['serve:test']).toBe('npm run build && npm run preview');
    expect(playwrightConfig).toContain("command: 'npm run serve:test'");
  });

  it('keeps static assets immutable while revalidating the app shell', () => {
    const config = readJson('public/staticwebapp.config.json');
    const routes = new Map<string, Record<string, string>>(
      config.routes.map((route: { route: string; headers: Record<string, string> }) => [route.route, route.headers])
    );
    expect(routes.get('/assets/*')?.['Cache-Control']).toBe('public, max-age=31536000, immutable');
    expect(routes.get('/sw.js')?.['Cache-Control']).toContain('must-revalidate');
    expect(routes.get('/*')?.['Cache-Control']).toContain('must-revalidate');
  });

  it('serves known SPA routes explicitly and preserves real 404 responses', () => {
    const config = readJson('public/staticwebapp.config.json');
    expect(config.navigationFallback).toBeUndefined();
    for (const path of ['/', '/app', '/demo', '/privacy', '/terms']) {
      expect(config.routes).toContainEqual(expect.objectContaining({ route: path, rewrite: '/index.html' }));
    }
    expect(config.responseOverrides['404']).toEqual({ rewrite: '/not-found.html' });
    expect(existsSync('public/not-found.html')).toBe(true);
    expect(existsSync('public/404.html')).toBe(false);
  });

  it('gives the direct HTTP 404 the same navigation, legal links, and route metadata', () => {
    const notFound = readFileSync('public/not-found.html', 'utf8');
    for (const required of [
      '<title>Page not found — Done Here</title>',
      'name="description"',
      'rel="canonical"',
      'property="og:title"',
      'name="twitter:title"',
      'rel="icon"',
      'aria-label="Main navigation"',
      'href="/privacy"',
      'href="/terms"',
      'Built by Param Factory',
      '<main id="main"'
    ]) expect(notFound).toContain(required);
  });

  it('registers every product promise with exactly one tagged test', () => {
    const claims = readJson('.factory/claims.json') as Array<{ id: string; test: string }>;
    const tests = readSources('tests').join('\n');
    expect(new Set(claims.map((claim) => claim.id)).size).toBe(claims.length);
    for (const claim of claims) {
      expect(claim.test).toContain(`@claim:${claim.id}`);
      expect(tests.match(new RegExp(`@claim:${claim.id}`, 'g'))).toHaveLength(1);
    }
  });

  it('maps each independently audited public promise to a registered claim', () => {
    const claimIds = new Set((readJson('.factory/claims.json') as Array<{ id: string }>).map((claim) => claim.id));
    const publicPromises = [
      { file: 'README.md', copy: 'Works without internet after the first visit and can be installed as an app', claims: ['offline-reload', 'installable-pwa'] },
      { file: 'index.html', copy: 'No account needed.', claims: ['no-account'] },
      { file: 'src/main.ts', copy: 'You do not create an account to use Done Here.', claims: ['no-account'] },
      { file: 'src/main.ts', copy: 'Done Here does not rank people, assign points, or watch children.', claims: ['no-household-ranking'] },
      { file: 'src/main.ts', copy: 'The calendar is free.', claims: ['free-core'] },
      { file: 'src/main.ts', copy: 'Chores, notes, and every export stay free.', claims: ['free-core'] },
      { file: 'README.md', copy: 'Free core calendar with five photos', claims: ['free-core', 'photo-tier'] },
      { file: 'README.md', copy: 'No analytics, remote fonts, or third-party runtime scripts', claims: ['runtime-privacy'] },
      { file: 'README.md', copy: 'License verification sends only the pasted token to Sociobot.', claims: ['license-token-only'] },
      { file: 'src/main.ts', copy: 'Verification sends only this token to Sociobot.', claims: ['license-token-only'] },
      { file: 'src/main.ts', copy: 'License verification sends your license token to Sociobot.', claims: ['license-token-only'] },
      { file: 'src/main.ts', copy: 'A refunded license stops working.', claims: ['refunded-license'] }
    ];
    for (const promise of publicPromises) {
      expect(readFileSync(promise.file, 'utf8'), `${promise.file}: ${promise.copy}`).toContain(promise.copy);
      for (const claim of promise.claims) expect(claimIds, `${promise.copy} -> ${claim}`).toContain(claim);
    }
  });
});
