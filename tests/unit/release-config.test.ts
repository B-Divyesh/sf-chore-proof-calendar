import { readFileSync } from 'node:fs';
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

  it('registers each repaired promise with exactly one tagged test', () => {
    const claims = readJson('.factory/claims.json') as Array<{ id: string; test: string }>;
    const e2e = readFileSync('tests/e2e/claims.spec.ts', 'utf8');
    for (const id of ['json-restore', 'recurrence-bounds', 'completion-proof', 'keyboard-calendar']) {
      expect(claims.find((claim) => claim.id === id)?.test).toContain(`@claim:${id}`);
      expect(e2e.match(new RegExp(`@claim:${id}`, 'g'))).toHaveLength(1);
    }
  });
});
