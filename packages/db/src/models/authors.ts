import { text, sqliteTable } from 'drizzle-orm/sqlite-core';
import { UsersTable } from './users';

export const AuthorsTable = sqliteTable('Authors', {
  userId: text('userId')
    .notNull()
    .unique()
    .primaryKey()
    .references(() => UsersTable.id),
  bio: text('bio'),
});
