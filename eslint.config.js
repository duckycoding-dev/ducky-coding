export default [
  {
    files: [
      
    ],
    ignores: [
      'node_modules',
      '**/*/node_modules',
      '**/*/dist/*',
      '**/*/build/*',
    ],
    extends: [
    ],
    rules: {
      semi: 'error',
      'prefer-const': 'error'
    },
  }
];
