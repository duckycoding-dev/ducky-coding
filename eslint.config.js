// import typescriptEslint from '@typescript-eslint/eslint-plugin';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';

export default [
  // typescriptEslint.configs['eslint-recommended'],
  // {
  //   files: [],
  //   ignores: ['node_modules', '**/*/node_modules', '**/*/dist/*', '**/*/build/*'],
  //   plugins: {
  //     typescriptEslint: typescriptEslint,
  //     prettier: prettier,
  //   },
  //   extends: ['@typescript-eslint', 'prettier'],
  //   rules: {
  //     semi: 'error',
  //     'prefer-const': 'error',
  //   },
  //   parser: '@typescript-eslint/parser',
  //   parserOptions: {
  //     project: 'tsconfig.json',
  //   },
  // },

  eslintPluginPrettierRecommended,
  {
    ignores: ['**/*.test.js', '**/*/dist/**/js'],
  },
  {
    files: ['**/*.js', '*.js'],
    rules: {
      semi: 'error',
      'no-unused-vars': 'warn',
    },
  },
];
