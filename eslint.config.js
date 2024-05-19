// Good article about differences between .eslintrc (default) and eslint.config.js (flat config):
// https://www.raulmelo.me/en/blog/migration-eslint-to-flat-config

// You can either use the standandard default export with the following
// JSdoc documentation to provide type checking and intellisense to
// the configs array ...
/** @type {import('eslint').Linter.FlatConfig[]} */
// export default [
// ];

// Or you can use the following tseslint.confg() utility functions, which
// is just a wrapper to provide type checking and intellisense
// THIS IS NOT REQUIRED IN ORDER TO USE TSESLINT CONFIGS!!
// https://typescript-eslint.io/packages/typescript-eslint#config
import tseslint from 'typescript-eslint';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';

// ===== START: Fallback for configs that don't yet support Flat Config =====
import { FlatCompat } from '@eslint/eslintrc';
import path from 'path';
import { fileURLToPath } from 'url';

// mimic CommonJS variables -- not needed if using CommonJS
const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

const compat = new FlatCompat({
  baseDirectory: dirname, // optional; default: process.cwd()
  resolvePluginsRelativeTo: dirname, // optional
});
// ===== END: Fallback for configs that don't support Flat Config yet =====

export default tseslint.config(
  // ignore all files inside distribution folders
  {
    ignores: ['**/*/dist/**/*.js', '**/*/dist/**/*.d.ts', '**/*/build/**/*.js', '**/*/build/**/*.d.ts', '**/.vscode/**/*'],
    files: ['**/*.js', '*.js', '**/*.ts', '*.ts', '**/*.astro'],
  },
  // airbnb recommended linting rules
  ...compat.extends('airbnb-base'),
  // recommended linting configs from tseslint (maybe overridden later by "manual" tselint configs with plugin and languageOptions)
  ...tseslint.configs.strict,
  // disable type-aware linting on JS files
  {
    files: ['**/*.js'],
    ...tseslint.configs.disableTypeChecked,
  },
  // prettier recommended linting rules and prettierrc configs
  eslintPluginPrettierRecommended,
  // own custom rules
  {
    rules: {
      semi: 'error',
      // enable external packages imports
      'import/no-extraneous-dependencies': ['off'],
      'import/no-unresolved': 'off',
      'import/prefer-default-export': 'off',
      'import/extensions': 'off',
      '@typescript-eslint/no-unused-vars': 'warn',
      'max-len': [
        // https://eslint.org/docs/latest/rules/max-len
        'error',
        {
          code: 140, // this value should match what's defined in prettier.config.js's printWidth
          comments: 140,
          ignoreComments: true,
          ignoreUrls: true,
          ignoreStrings: true,
          ignoreTemplateLiterals: true,
        },
      ],
    },
  },
);
