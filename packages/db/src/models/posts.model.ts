import { z } from 'zod';
import { text, sqliteTable, integer } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';
import {
  ContentStatus,
  ContentStatusSchema,
} from '@ducky-coding/types/entities';
import { PostDTO } from '@ducky-coding/types/DTOs';
import { TopicsTable, TopicSchema } from './topics.model';
import { ImagesTable, ImageSchema } from './images.model';
import { UserSchema } from './users.model';

export const PostsTable = sqliteTable('posts', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  slug: text('slug').notNull(),
  title: text('title').notNull(),
  bannerImageId: integer('bannerImageId').references(() => ImagesTable.id),
  summary: text('summary').notNull(),
  content: text('content').notNull(),
  topicTitle: text('topicTitle')
    .references(() => TopicsTable.title)
    .notNull(),
  language: text('language').notNull(),
  timeToRead: integer('timeToRead').notNull().default(1), // value representing minutes
  status: text('status').$type<ContentStatus>().notNull().default('draft'), // value should be one of [draft, published, deleted] (can't yet use enums )
  createdAt: integer('createdAt', { mode: 'number' })
    .notNull()
    .default(sql`(strftime('%s', 'now'))`),
  updatedAt: integer('updatedAt', { mode: 'number' })
    .notNull()
    .default(sql`(strftime('%s', 'now'))`),
  publishedAt: integer('publishedAt', { mode: 'number' }),
  deletedAt: integer('deletedAt', { mode: 'number' }), // need to use date type instead of integer maybe
});

export const PostSchema = z.object({
  id: z.number(),
  slug: z.string(),
  title: z.string(),
  bannerImage: ImageSchema,
  summary: z.string().optional(),
  content: z.string(),
  authors: z.array(UserSchema).min(1),
  topic: TopicSchema,
  tags: z.array(z.string()).min(1),
  language: z.string().default('en'),
  timeToRead: z.number(),
  status: ContentStatusSchema,
  createdAt: z.number(),
  updatedAt: z.number(),
  publishedAt: z.number().optional(),
  deletedAt: z.number().optional(),
});

export type InsertPost = typeof PostsTable.$inferInsert;
export type Post = typeof PostsTable.$inferSelect;

export function mapToPostDTO(selectedPost: Post): PostDTO {
  return {
    id: selectedPost.id,
    slug: selectedPost.slug,
    title: selectedPost.title,
    bannerImageId: selectedPost.bannerImageId ?? undefined,
    summary: selectedPost.summary,
    content: selectedPost.content,
    topicTitle: selectedPost.topicTitle,
    language: selectedPost.language,
    timeToRead: selectedPost.timeToRead,
    status: selectedPost.status,
    createdAt: selectedPost.createdAt,
    updatedAt: selectedPost.updatedAt,
    publishedAt: selectedPost.publishedAt ?? undefined,
    deletedAt: selectedPost.deletedAt ?? undefined,
  };
}
