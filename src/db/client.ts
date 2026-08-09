import { getEnvs } from '@utils/env';
import { createDb, type Db } from './create-db';

let shared: Db | undefined;

// Memoised so importing a repository neither validates env nor opens a
// connection — that only happens once a query actually runs.
export const getDb = (): Db => {
  const envs = getEnvs();
  return (shared ??= createDb({
    url: envs.TURSO_DATABASE_URL,
    authToken: envs.TURSO_AUTH_TOKEN,
  }));
};
