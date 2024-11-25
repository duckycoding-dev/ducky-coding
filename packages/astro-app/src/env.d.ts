/* eslint-disable @typescript-eslint/triple-slash-reference */
/// <reference path="../.astro/actions.d.ts" />
/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

/**
 * ===================================================
 * ====== Enable intellisense for ENV Variables ======
 * ===================================================
 */

interface ImportMetaEnv {
  // env variables declared inside the .env file
  // REMEMBER: only variables prefixed with PUBLIC_ are available on the client side
  PUBLIC_BASE_SITE_URL: string;
  SERVER_LOGS_LEVEL: import('@ducky-coding/utils/logger').LogLevel;
  CLIENT_LOGS_LEVEL: import('@ducky-coding/utils/logger').LogLevel;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
