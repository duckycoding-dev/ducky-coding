import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import { mkdirSync } from 'node:fs';
import path from 'node:path';

// The single definition of how a drizzle handle is built. Deliberately free of
// any env import so it stays safe to use from `astro.config.mjs` (plain Node,
// before Vite) and from tests, which point it at a throwaway file: database.

export interface DbConfig {
  url: string;
  authToken?: string;
}

/**
 * libSQL creates a missing database *file* but not its parent directory, failing
 * with `ConnectionFailed(… 14)` instead. `database/` is gitignored, so every
 * fresh clone — CI included — starts without it.
 */
const ensureLocalDirectory = (url: string): void => {
  if (!url.startsWith('file:')) return;

  const filePath = url.slice('file:'.length);
  if (filePath === '' || filePath === ':memory:') return;

  mkdirSync(path.dirname(path.resolve(filePath)), { recursive: true });
};

export const createDb = (config: DbConfig) => {
  ensureLocalDirectory(config.url);

  return drizzle({
    client: createClient({ url: config.url, authToken: config.authToken }),
    casing: 'snake_case',
  });
};

export type Db = ReturnType<typeof createDb>;
