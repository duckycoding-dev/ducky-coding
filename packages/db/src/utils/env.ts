import dotenv from 'dotenv';

// TODO CHECK THIS FOR DEPLOYMENT: WHAT ENV WOULD IT USE???
dotenv.config({ path: './.env.development' });

interface Env {
  TURSO_DATABASE_URL: string;
  TURSO_AUTH_TOKEN?: string;
  JWT_SECRET_KEY: string;
  REFRESH_JWT_SECRET_KEY: string;
}

export const TURSO_DATABASE_URL =
  process.env.TURSO_DATABASE_URL ?? '127.0.0.1:8080';
export const TURSO_AUTH_TOKEN = process.env.TURSO_AUTH_TOKEN || undefined;
export const { JWT_SECRET_KEY } = process.env;
export const { REFRESH_JWT_SECRET_KEY } = process.env;

if (!TURSO_DATABASE_URL) {
  throw new Error('TURSO_DATABASE_URL is not defined');
}
if (!JWT_SECRET_KEY) {
  throw new Error('JWT_SECRET_KEY is not defined');
}
if (!REFRESH_JWT_SECRET_KEY) {
  throw new Error('REFRESH_JWT_SECRET_KEY is not defined');
}

export const envs: Env = {
  TURSO_DATABASE_URL,
  TURSO_AUTH_TOKEN,
  JWT_SECRET_KEY,
  REFRESH_JWT_SECRET_KEY,
};
