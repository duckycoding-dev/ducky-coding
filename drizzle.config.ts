import { defineConfig } from 'drizzle-kit';

// process.env is not populated locally unless we integrated dotenv
// the fallback hardcoded url is for local development
// in production, the environment variables are set by/in the hosting provider
export default defineConfig({
  schema: './src/db/features/**/*.model.ts',
  out: './src/db/migrations',
  dialect: 'turso',
  casing: 'snake_case',
  dbCredentials: {
    url: process.env.TURSO_DATABASE_URL ?? 'http://127.0.0.1:8080',
    authToken: process.env.TURSO_AUTH_TOKEN,
  },
});
