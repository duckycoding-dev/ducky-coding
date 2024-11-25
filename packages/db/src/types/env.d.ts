import { LogLevelSchema } from '@ducky-coding/utils/logger';
import z from 'zod';

const envVariables = z.object({
  DB_PACKAGE_LOGS_LEVEL: z.enum(LogLevelSchema),
  TURSO_DATABASE_URL: z.string(),
  TURSO_AUTH_TOKEN: z.string().optional(),
});

// ensure that the env variables are defined correctly
envVariables.parse(process.env);

// this parsing is probably not ran because this is a .d.ts file
// but I'll keep it for now, and see if I should swap to a .ts file

declare global {
  namespace NodeJS {
    interface ProcessEnv extends z.infer<typeof envVariables> {}
  }
  interface ImportMeta {
    readonly env: z.infer<typeof envVariables>;
  }
}

// Solution using zod and zod's infer method by Matt Pocock
// https://www.youtube.com/watch?v=q1im-hMlKhM
