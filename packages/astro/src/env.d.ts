/// <reference types="astro/client" />


/**
 * ===================================================
 * ====== Enable intellisense for ENV Variables ======
 * ===================================================
 */

interface ImportMetaEnv {
  // env variables declared inside the .env file
  // REMEMBER: only variables prefixed with PUBLIC_ are available on the client side
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}