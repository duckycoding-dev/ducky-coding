import { sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const TagsTable = sqliteTable('tags', {
  name: text('name').primaryKey().unique().notNull(),
});

export type InsertTag = typeof TagsTable.$inferInsert;
export type SelectTag = typeof TagsTable.$inferSelect;
