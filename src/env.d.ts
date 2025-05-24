/* eslint-disable @typescript-eslint/triple-slash-reference */
/*
/// <reference path="../.astro/actions.d.ts" />
/// <reference path="../.astro/types.d.ts" />
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
