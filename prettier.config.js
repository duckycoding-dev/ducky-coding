/** @type {import("prettier").Config} */
const config = {
  useTabs: false,
  tabWidth: 2,
  printWidth: 120,
  semi: true,
  singleQuote: true,
  jsxSingleQuote: true,
  bracketSpacing: true,
  arrowParens: 'always',
  endOfLine: 'auto',
  quoteProps: 'as-needed',
  trailingComma: 'all',
  singleAttributePerLine: false,
  plugins: ['prettier-plugin-astro', 'prettier-plugin-tailwindcss'],
  overrides: [
    {
      files: '**/+.astro',
      options: {
        parser: 'astro',
      },
    },
  ],
};

export default config;
