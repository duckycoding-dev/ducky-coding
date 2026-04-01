import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';

import { envs } from '@utils/env';

const turso = createClient({
  url: envs.TURSO_DATABASE_URL,
  authToken: envs.TURSO_AUTH_TOKEN,
});

export const db = drizzle({ client: turso, casing: 'snake_case' });
