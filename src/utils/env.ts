import z from 'zod';

import { logLevels } from '@utils/logs/logger';

// env variables declared inside the .env file
// import.meta.env is used for Vite and is available in the client-side code
// process.env is used for Node.js and is available in the server-side code and scripts

const envVariables = z.object({
  BASE_SITE_URL: z.url(),
  SERVER_LOGS_LEVEL: z.enum(logLevels),
  CLIENT_LOGS_LEVEL: z.enum(logLevels),
  TURSO_DATABASE_URL: z.url(),
  TURSO_AUTH_TOKEN: z.string().optional(),
});

export type Envs = z.infer<typeof envVariables>;

let cached: Envs | undefined;

// Validated on first use rather than on import: importing a module should not
// have side effects, otherwise anything that pulls in the db layer (a test, a
// script, a type-only consumer) fails before it runs. astro.config.mjs still
// validates the same variables up front via `envField` + validateSecrets.
export const getEnvs = (): Envs =>
  (cached ??= envVariables.parse(import.meta.env ?? process.env));
