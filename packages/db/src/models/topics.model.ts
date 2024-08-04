import { integer, text, sqliteTable } from 'drizzle-orm/sqlite-core';
import { TagsTable } from './tags.model';
import { ImagesTable } from './images.model';

export const TopicsTable = sqliteTable('topics', {
  title: text('title')
    .primaryKey()
    .unique()
    .notNull()
    .references(() => TagsTable.name),
  imageId: integer('imageId').references(() => ImagesTable.id),
  slug: text('slug').unique().notNull(),
});

export type InsertTopic = typeof TopicsTable.$inferInsert;
export type SelectTopic = typeof TopicsTable.$inferSelect;
