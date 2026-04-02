/*
/// <reference types="astro/client" />
*/

import type { envs } from '@utils/env';

declare global {
  // namespace NodeJS {
  //   interface ProcessEnv extends typeof envs;
  // }
  interface ImportMeta {
    readonly env: typeof envs;
  }
}
