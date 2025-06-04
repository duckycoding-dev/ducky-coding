import { text, sqliteTable, integer } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';
import {
  createSelectSchema,
  createInsertSchema,
  createUpdateSchema,
} from 'drizzle-zod';
import { imagesTable } from '../images/images.model';
import { topicsTable } from '../topics/topics.model';
import { z } from 'zod';

export const ContentStatusSchema = z
  .enum(['draft', 'published', 'deleted'])
  .default('draft');
export type ContentStatus = z.infer<typeof ContentStatusSchema>;

// This SQLite expression calculates the current Unix timestamp in milliseconds.
const currentTimestampMillisSQL = sql`(CAST(ROUND((julianday('now') - 2440587.5) * 86400000) AS INTEGER))`;

export const postsTable = sqliteTable('posts', {
  id: integer().primaryKey({ autoIncrement: true }),
  slug: text().notNull(),
  title: text().notNull(),
  bannerImagePath: text().references(() => imagesTable.path),
  summary: text().notNull(),
  content: text().notNull(),
  author: text().notNull().default('DuckyCoding'),
  topicTitle: text()
    .references(() => topicsTable.title)
    .notNull(),
  language: text().notNull().default('en'),
  timeToRead: integer().notNull().default(1), // value representing minutes
  status: text().$type<ContentStatus>().notNull().default('draft'), // value should be one of [draft, published, deleted] (can't yet use enums )
  createdAt: integer({ mode: 'number' })
    .notNull()
    .default(currentTimestampMillisSQL),
  updatedAt: integer({ mode: 'number' })
    .notNull()
    .default(currentTimestampMillisSQL),
  publishedAt: integer({ mode: 'number' }),
  deletedAt: integer({ mode: 'number' }), // need to use date type instead of integer maybe
  isFeatured: integer({ mode: 'boolean' }).notNull().default(false),
});

export const postSchema = createSelectSchema(postsTable);
export const insertPostSchema = createInsertSchema(postsTable);
export const updatePostSchema = createUpdateSchema(postsTable);
export type Post = z.infer<typeof postSchema>;
export type InsertPost = z.infer<typeof insertPostSchema>;
export type UpdatePost = z.infer<typeof updatePostSchema>;
