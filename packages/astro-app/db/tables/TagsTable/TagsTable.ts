import { sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const TagsTable = sqliteTable('Tags', {
  name: text('name').primaryKey().unique().notNull(),
});

export type InsertTag = typeof TagsTable.$inferInsert;
export type SelectTag = typeof TagsTable.$inferSelect;
