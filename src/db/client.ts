import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';

// Used process.env instead of import.meta.env, as import.meta is not available in Node.js scripts.

const turso = createClient({
  url: process.env.TURSO_DATABASE_URL ?? 'http://127.0.0.1:8080',
  authToken: process.env.TURSO_AUTH_TOKEN,
});

console.log('DAVIDELOG turso', process.env.TURSO_DATABASE_URL); // need to understand why this process.env refers to the env file in the astro-app package, and not in the db package

export const db = drizzle({ client: turso, casing: 'snake_case' });
