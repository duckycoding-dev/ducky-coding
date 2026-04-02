import { defineConfig } from 'eslint/config';
import eslintConfigPrettier from 'eslint-config-prettier';
import eslintPluginAstro from 'eslint-plugin-astro';
import importX from 'eslint-plugin-import-x';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import unusedImports from 'eslint-plugin-unused-imports';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default defineConfig(
  // ============================================================
  // SECTION 1: FOUNDATION (do not edit unless you know what
  //            you're doing — order matters here)
  // ============================================================

  // 1a. Global ignores — MUST be a standalone object with ONLY `ignores`
  //     (no `files` key), otherwise ESLint treats it as a per-config filter
  //     instead of a true global ignore.
  {
    ignores: [
      '**/node_modules/**',
      '**/*.md',
      '**/*.mdx',
      '**/.vscode/**/*',
      '**/.husky/**',
      '**/.astro/**',
      '**/.netlify/**',
      '**/.claude/**',
      '**/dist/**',
      '**/build/**',
      'package-lock.json',
      'docs/**',
      'best-practices/**',
      'database/**',
    ],
  },

  // 1b. TypeScript strict rules (syntactic only, no type-aware rules).
  //     To upgrade to type-aware linting for .ts files, replace with
  //     ...tseslint.configs.strictTypeChecked and add a projectService
  //     config block scoped to **/*.{ts,tsx} (see docs for details).
  //     NOTE: astro-eslint-parser does NOT support projectService, so
  //     .astro type checking is always handled by `astro check`.
  ...tseslint.configs.strict,

  // 1c. Prettier integration — reports formatting diffs as ESLint errors
  //     so that `eslint --fix` also formats code.
  eslintPluginPrettierRecommended,

  // 1d. Astro plugin — enables linting of .astro frontmatter + template.
  ...eslintPluginAstro.configs.recommended,

  // 1e. Global language options — provides Node.js and browser globals
  //     (console, process, window, etc.) to avoid false `no-undef` errors.
  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.browser,
      },
    },
  },

  // 1f. Tell astro-eslint-parser to use @typescript-eslint/parser for the
  //     frontmatter script block. Without this, defineConfig (unlike the
  //     deprecated tseslint.config) does not wire the sub-parser
  //     automatically, and the default JS parser chokes on TS syntax.
  {
    files: ['**/*.astro'],
    languageOptions: {
      parserOptions: {
        parser: tseslint.parser,
      },
    },
  },

  // 1g. Disable type-aware rules for plain JS config files (they are not
  //     covered by any tsconfig).
  {
    files: ['**/*.{js,mjs,cjs}'],
    ...tseslint.configs.disableTypeChecked,
  },

  // ============================================================
  // SECTION 2: PROJECT RULES (edit freely — add, remove, or
  //            adjust rules to match project conventions)
  // ============================================================

  // --- ESLint core rules ---
  {
    rules: {
      'prefer-const': 'error',
      semi: 'error',
      'consistent-return': 'off',
      'func-names': ['off'],
      'max-len': [
        'error',
        {
          code: 80, // should match printWidth in prettier.config.js
          comments: 80,
          ignoreComments: true,
          ignoreUrls: true,
          ignoreStrings: true,
          ignoreTemplateLiterals: true,
        },
      ],
    },
  },

  // --- Import rules (eslint-plugin-import-x) ---
  {
    plugins: {
      'import-x': importX,
    },
    rules: {
      'import-x/no-extraneous-dependencies': 'off',
      'import-x/no-unresolved': 'off',
      'import-x/prefer-default-export': 'off',
      'import-x/extensions': 'off',
      'import-x/newline-after-import': 'warn',
    },
  },

  // --- Import sorting (autofixable ordering) ---
  {
    plugins: {
      'simple-import-sort': simpleImportSort,
    },
    rules: {
      'simple-import-sort/imports': [
        'error',
        {
          groups: [
            // 1. Side-effect imports
            ['^\\u0000'],
            // 2. All external packages — Zod first (used heavily for
            //    content schemas), then Astro ecosystem, then everything else.
            ['^zod', '^astro', '^@astrojs/', '^@?\\w'],
            // 3. Path aliases + relative imports.
            //    Aliases are MANUAL: update when adding new tsconfig paths.
            //    See tsconfig.json "paths" for the source.
            //    Relative imports sort after aliases alphabetically (@ < .).
            [
              '^@(components|layouts|content|utils|styles|assets|services|typings|db)/',
              '^\\.',
            ],
          ],
        },
      ],
      'simple-import-sort/exports': 'error',
    },
  },

  // --- Unused imports (autofixable removal) ---
  {
    plugins: {
      'unused-imports': unusedImports,
    },
    rules: {
      'unused-imports/no-unused-imports': 'warn',
      'unused-imports/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
    },
  },

  // --- Server-only imports: block in .astro client-side <script> tags ---
  // placing this as a placeholder if we will have need for this in the future (e.g. if we add server-only packages like pino or Redis that should not be imported in client-side code). Note that this does NOT block imports in .ts files, so server-only packages can still be used in .ts files that are imported by .astro frontmatter.
  {
    files: ['**/*.astro/*.ts', '**/*.astro/*.js'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@db/**/*', '**/db/**/*'],
              message:
                'You are trying to import a server-only file. Do not import it in client-side <script> tags. Use it in .astro frontmatter or .ts server files only.',
            },
          ],
        },
      ],
    },
  },

  // --- Imports that should not be directly used in astro files at all ---
  {
    files: ['**/*.astro'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              regex:
                '^(?:@db|(?:\\.{1,2}/)+.*?/db)(?!.*\\.(?:service|model)(?:\\.[cm]?ts)?$)',
              message:
                'You are trying to import a db file. Only *.service.ts and *.model.ts files from the db module can be imported in .astro files.',
            },
          ],
        },
      ],
    },
  },

  // --- TypeScript-specific rules ---
  {
    rules: {
      // Disabled for imports — handled by unused-imports plugin above.
      // Still active for variables/args/caught errors via unused-imports.
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/no-non-null-assertion': 'error',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-empty-object-type': 'off',
      '@typescript-eslint/consistent-type-imports': [
        'error',
        {
          prefer: 'type-imports',
          fixStyle: 'inline-type-imports',
        },
      ],
    },
  },

  // ============================================================
  // SECTION 3: PRETTIER (must be last — disables all ESLint
  //            rules that conflict with Prettier formatting)
  // ============================================================
  eslintConfigPrettier,
);
