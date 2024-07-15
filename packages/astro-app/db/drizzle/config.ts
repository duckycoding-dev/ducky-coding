import type { Config } from 'drizzle-kit';

const config: Config = {
  schema: './drizzle/schema.ts',
  out: './drizzle/migrations',
  dialect: 'sqlite',
  driver: 'turso',
  dbCredentials: {
    url: process.env.TURSO_DATABASE_URL ?? 'http://127.0.0.1:8080',
    authToken: process.env.TURSO_AUTH_TOKEN,
  },
};

export default config;
