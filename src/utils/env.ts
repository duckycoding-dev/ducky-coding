import { logLevels } from '@utils/logs/logger.js';
import z from 'zod';

// env variables declared inside the .env file
// import.meta.env is used for Vite and is available in the client-side code
// process.env is used for Node.js and is available in the server-side code and scripts run by tsx

const envVariables = z.object({
  BASE_SITE_URL: z.string().url(),
  SERVER_LOGS_LEVEL: z.enum(logLevels),
  CLIENT_LOGS_LEVEL: z.enum(logLevels),
  TURSO_DATABASE_URL: z.string().url(),
  TURSO_AUTH_TOKEN: z.string().optional(),
});

// ensure that the env variables are defined correctly
export const envs = envVariables.parse(import.meta.env ?? process.env);
