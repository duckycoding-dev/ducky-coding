import { text, sqliteTable } from 'drizzle-orm/sqlite-core';
import { TagsTable } from '@db/tables/TagsTable';

export const TopicsTable = sqliteTable('Topics', {
  title: text('title')
    .primaryKey()
    .unique()
    .notNull()
    .references(() => TagsTable.name),
  imageFilename: text('imageFilename'),
  imageAlt: text('imageAlt'),
});

export type InsertTopic = typeof TopicsTable.$inferInsert;
export type SelectTopic = typeof TopicsTable.$inferSelect;
