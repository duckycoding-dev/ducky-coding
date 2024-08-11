import { z } from 'zod';
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

export const AuthorSchema = z.object({
  userId: z.string(),
  bio: z.string().optional(),
});

export type InsertAuthor = typeof AuthorsTable.$inferInsert;
export type Author = typeof AuthorsTable.$inferSelect;
