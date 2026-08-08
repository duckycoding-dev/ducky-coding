import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

const fromRoot = (relativePath: string): string =>
  fileURLToPath(new URL(relativePath, import.meta.url));

// Mirrors the "paths" map in tsconfig.json — keep the two in sync.
export default defineConfig({
  resolve: {
    alias: {
      '@components': fromRoot('./src/components'),
      '@layouts': fromRoot('./src/layouts'),
      '@content': fromRoot('./src/content'),
      '@data': fromRoot('./src/data'),
      '@utils': fromRoot('./src/utils'),
      '@styles': fromRoot('./src/styles'),
      '@assets': fromRoot('./src/assets'),
      '@services': fromRoot('./src/services'),
      '@typings': fromRoot('./src/types'),
      '@db': fromRoot('./src/db'),
      '@libs': fromRoot('./src/libs'),
    },
  },
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts', 'src/**/*.test.ts'],
  },
});
