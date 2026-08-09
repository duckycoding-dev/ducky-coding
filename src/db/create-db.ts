import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';

// The single definition of how a drizzle handle is built. Deliberately free of
// any env import so it stays safe to use from `astro.config.mjs` (plain Node,
// before Vite) and from tests, which point it at a throwaway file: database.

export interface DbConfig {
  url: string;
  authToken?: string;
}

export const createDb = (config: DbConfig) =>
  drizzle({
    client: createClient({ url: config.url, authToken: config.authToken }),
    casing: 'snake_case',
  });

export type Db = ReturnType<typeof createDb>;
