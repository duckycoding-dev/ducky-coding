import { Lucia } from 'lucia';
import { DrizzleSQLiteAdapter } from '@lucia-auth/adapter-drizzle';
import { SessionsTable, UsersTable } from '@ducky-coding/db/models';
import { db } from '@ducky-coding/db/client';
import type { UserDTO } from '@ducky-coding/types/DTOs';

// @ts-expect-error -- Ignoring type mismatch between LibSQLDatabase and BaseSQLiteDatabase
const adapter = new DrizzleSQLiteAdapter(db, SessionsTable, UsersTable); // your adapter

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
      id: attributes.id,
    };
  },
  // getSessionAttributes: (attributes) => {  // this function is used if we are expanding the SessionsTable with other data, and want to retrieve that as well
  //   return {
  //     expiresAt: attributes.expiresAt,
  //     userId: attributes.userId,
  //     id: attributes.id,
  //   };
  // },
});

interface DatabaseUserAttributes extends UserDTO {}
// interface DatabaseSessionAttributes extends SessionDTO {} // will be defined in the future if we need to store and retrieve other data from the sessions table

declare module 'lucia' {
  interface Register {
    Lucia: typeof lucia;
    UserId: number; // lucia's default UserId type is "string", but my database uses "number"

    DatabaseUserAttributes: DatabaseUserAttributes;
    // DatabaseSessionAttributes: DatabaseSessionAttributes;
  }
}
