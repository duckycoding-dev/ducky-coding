/*
/// <reference types="astro/client" />
*/

import type { Envs } from '@utils/env';

declare global {
  // namespace NodeJS {
  //   interface ProcessEnv extends Envs;
  // }
  interface ImportMeta {
    readonly env: Envs;
  }
}
