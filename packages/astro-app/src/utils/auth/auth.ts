import { Lucia } from 'lucia';
import { DrizzleSQLiteAdapter } from '@lucia-auth/adapter-drizzle';
import { SessionsTable, UsersTable } from '@ducky-coding/db/models';
import { db } from '@ducky-coding/db/client';
import type { UserDTO } from '@ducky-coding/types/DTOs';

const adapter = new DrizzleSQLiteAdapter(
  db as any,
  SessionsTable as any,
  UsersTable as any,
); // your adapter

export const lucia = new Lucia(adapter, {
  sessionCookie: {
    attributes: {
      // set to `true` when using HTTPS
      secure: import.meta.env.PROD,
    },
  },
  getUserAttributes: (attributes) => {
    return {
      username: attributes.username,
      email: attributes.email,
      name: attributes.name,
    };
  },
});

interface DatabaseUserAttributes extends UserDTO {}

declare module 'lucia' {
  interface Register {
    Lucia: typeof lucia;
    DatabaseUserAttributes: DatabaseUserAttributes;
  }
}
