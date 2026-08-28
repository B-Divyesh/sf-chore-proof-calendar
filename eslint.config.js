import eslint from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['dist/**', 'test-results/**', 'playwright-report/**', 'assets/**', 'public/sw.js'] },
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  { files: ['src/**/*.ts'], languageOptions: { globals: globals.browser }, rules: { '@typescript-eslint/no-unused-vars': ['error', { varsIgnorePattern: '^_' }] } },
  { files: ['tests/**/*.ts', '*.config.ts'], languageOptions: { globals: globals.node } }
);
