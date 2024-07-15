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

export type Topic = {
  title: string;
  imageFilename?: string;
  imageAlt?: string;
};

// Type for inserting new topics (in this case, it's the same as Topic)
export type InsertTopic = Topic;
