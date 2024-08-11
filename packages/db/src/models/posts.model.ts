import { z } from 'zod';
import { text, sqliteTable, integer } from 'drizzle-orm/sqlite-core';
import {
  ContentStatus,
  ContentStatusSchema,
} from '@ducky-coding/types/entities';
import { TopicsTable, TopicSchema } from './topics.model';
import { ImagesTable, ImageSchema } from './images.model';
import { AuthorSchema } from './authors.model';

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
  createdAt: integer('createdAt', { mode: 'number' })
    .notNull()
    .default(Date.now()),
  updatedAt: integer('updatedAt', { mode: 'number' })
    .notNull()
    .default(Date.now()),
  publishedAt: integer('publishedAt', { mode: 'number' }),
  deletedAt: integer('deletedAt', { mode: 'number' }), // need to use date type instead of integer maybe
});

export const PostSchema = z.object({
  slug: z.string(),
  title: z.string(),
  bannerImage: ImageSchema,
  summary: z.string().optional(),
  content: z.string(),
  authors: z.array(AuthorSchema).min(1),
  topic: TopicSchema,
  tags: z.array(z.string()).min(1),
  language: z.enum(['en', 'it']).default('en'),
  timeToRead: z.number(),
  status: ContentStatusSchema,
  createdAt: z.number(),
  updatedAt: z.number(),
  publishedAt: z.number().optional(),
  deletedAt: z.number().optional(),
});

export type Post = z.infer<typeof PostSchema>;

export type InsertPost = typeof PostsTable.$inferInsert;
export type SelectPost = typeof PostsTable.$inferSelect;
