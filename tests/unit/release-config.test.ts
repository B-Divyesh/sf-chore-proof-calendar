import { readFileSync } from 'node:fs';
import { existsSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const readJson = (path: string) => JSON.parse(readFileSync(path, 'utf8'));

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

  it('registers every product promise with exactly one tagged test', () => {
    const claims = readJson('.factory/claims.json') as Array<{ id: string; test: string }>;
    const tests = [readFileSync('tests/e2e/claims.spec.ts', 'utf8'), readFileSync('tests/unit/exports.test.ts', 'utf8')].join('\n');
    expect(new Set(claims.map((claim) => claim.id)).size).toBe(claims.length);
    for (const claim of claims) {
      expect(claim.test).toContain(`@claim:${claim.id}`);
      expect(tests.match(new RegExp(`@claim:${claim.id}`, 'g'))).toHaveLength(1);
    }
  });
});
