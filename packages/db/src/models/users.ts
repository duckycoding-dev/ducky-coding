import { text, sqliteTable } from 'drizzle-orm/sqlite-core';

export const UsersTable = sqliteTable('Users', {
  id: text('id').primaryKey().unique().notNull(),
  username: text('username').unique().notNull(),
  email: text('email').unique().notNull(),
  name: text('name').notNull(),
  lastName: text('lastName'),
});
