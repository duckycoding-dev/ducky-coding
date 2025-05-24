import { logLevels } from '@utils/logs/logger';
import z from 'zod';

// env variables declared inside the .env file
// REMEMBER: only variables prefixed with PUBLIC_ are available on the client side
const envVariables = z.object({
  BASE_SITE_URL: z.string().url(),
  SERVER_LOGS_LEVEL: z.enum(logLevels),
  CLIENT_LOGS_LEVEL: z.enum(logLevels),
  TURSO_DATABASE_URL: z.string().url(),
  TURSO_AUTH_TOKEN: z.string().optional(),
});

// ensure that the env variables are defined correctly
export const envs = envVariables.parse(process.env);
