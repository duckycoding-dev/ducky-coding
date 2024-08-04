import { text, sqliteTable, integer } from 'drizzle-orm/sqlite-core';
import { TopicsTable } from './topics.model';
import { ImagesTable } from './images.model';

export const PostsTable = sqliteTable('posts', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  slug: text('slug').unique().notNull(),
  topicTitle: integer('topicTitle').references(() => TopicsTable.title),
  bannerImageId: integer('bannerImageId').references(() => ImagesTable.id),
  createdAt: integer('createdAt', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updatedAt', { mode: 'timestamp' }).notNull(),
  publishedAt: integer('publishedAt', { mode: 'timestamp' }),
  deletedAt: integer('deletedAt', { mode: 'timestamp' }), // need to check date type instead of integer maybe
});
