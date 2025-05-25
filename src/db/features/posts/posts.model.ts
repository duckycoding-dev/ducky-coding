import { text, sqliteTable, integer } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';
import { type ContentStatus } from '@custom-types/entities';
import {
  createSelectSchema,
  createInsertSchema,
  createUpdateSchema,
} from 'drizzle-zod';
import { imagesTable } from '../images/images.model';
import { topicsTable } from '../topics/topics.model';
import { z } from 'zod';

export const postsTable = sqliteTable('posts', {
  id: integer().primaryKey({ autoIncrement: true }),
  slug: text().notNull(),
  title: text().notNull(),
  bannerImageId: integer().references(() => imagesTable.id),
  summary: text().notNull(),
  content: text().notNull(),
  topicTitle: text()
    .references(() => topicsTable.title)
    .notNull(),
  language: text().notNull(),
  timeToRead: integer().notNull().default(1), // value representing minutes
  status: text().$type<ContentStatus>().notNull().default('draft'), // value should be one of [draft, published, deleted] (can't yet use enums )
  createdAt: integer({ mode: 'number' })
    .notNull()
    .default(sql`(strftime('%s', 'now'))`),
  updatedAt: integer({ mode: 'number' })
    .notNull()
    .default(sql`(strftime('%s', 'now'))`),
  publishedAt: integer({ mode: 'number' }),
  deletedAt: integer({ mode: 'number' }), // need to use date type instead of integer maybe
});

export const postSchema = createSelectSchema(postsTable);
export const insertPostSchema = createInsertSchema(postsTable);
export const updatePostSchema = createUpdateSchema(postsTable);
export type Post = z.infer<typeof postSchema>;
export type InsertPost = z.infer<typeof insertPostSchema>;
export type UpdatePost = z.infer<typeof updatePostSchema>;
