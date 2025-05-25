import {
  sqliteTable,
  integer,
  primaryKey,
  text,
} from 'drizzle-orm/sqlite-core';
import {
  createSelectSchema,
  createInsertSchema,
  createUpdateSchema,
} from 'drizzle-zod';
import { postsTable } from './posts.model';
import { tagsTable } from '../tags/tags.model';
import { z } from 'zod';

export const postsTagsTable = sqliteTable(
  'posts_tags',
  {
    postId: integer()
      .notNull()
      .references(() => postsTable.id),
    tagName: text()
      .notNull()
      .references(() => tagsTable.name),
  },
  (table) => [primaryKey({ columns: [table.postId, table.tagName] })],
);

export const postTagsSchema = createSelectSchema(postsTagsTable);
export const insertPostTagsSchema = createInsertSchema(postsTagsTable);
export const updatePostTagsSchema = createUpdateSchema(postsTagsTable);
export type PostTag = z.infer<typeof postTagsSchema>;
export type InsertPostTag = z.infer<typeof insertPostTagsSchema>;
export type UpdatePostTag = z.infer<typeof updatePostTagsSchema>;
