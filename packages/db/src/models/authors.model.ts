import { text, sqliteTable } from 'drizzle-orm/sqlite-core';
import { UsersTable } from './users.model';

export const AuthorsTable = sqliteTable('authors', {
  userId: text('userId')
    .notNull()
    .unique()
    .primaryKey()
    .references(() => UsersTable.id),
  bio: text('bio'),
});
