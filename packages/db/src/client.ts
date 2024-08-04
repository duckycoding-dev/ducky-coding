import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';

// Used process.env instead of import.meta.env, as import.meta is not available in Node.js scripts.

const turso = createClient({
  url: process.env.TURSO_DATABASE_URL ?? 'http://127.0.0.1:8080',
  authToken: process.env.TURSO_AUTH_TOKEN,
});

export const db = drizzle(turso);
