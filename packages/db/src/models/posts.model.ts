import { ContentStatus } from '@ducky-coding/types/entities';
import { text, sqliteTable, integer } from 'drizzle-orm/sqlite-core';
import { TopicsTable } from './topics.model';
import { ImagesTable } from './images.model';

export const PostsTable = sqliteTable('posts', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  slug: text('slug').notNull(),
  title: text('title').notNull(),
  bannerImageId: integer('bannerImageId').references(() => ImagesTable.id),
  summary: text('summary').notNull(),
  content: text('content').notNull(),
  topicTitle: integer('topicTitle').references(() => TopicsTable.title),
  language: text('language').notNull(),
  timeToRead: integer('timeToRead').notNull().default(1), // value representing minutes
  status: text('status').$type<ContentStatus>().notNull().default('draft'), // value should be one of [draft, published, deleted] (can't yet use enums )
  createdAt: integer('createdAt', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updatedAt', { mode: 'timestamp' }).notNull(),
  publishedAt: integer('publishedAt', { mode: 'timestamp' }),
  deletedAt: integer('deletedAt', { mode: 'timestamp' }), // need to use date type instead of integer maybe
});
