import { type z } from 'zod';
import {
  integer,
  primaryKey,
  sqliteTable,
  text,
} from 'drizzle-orm/sqlite-core';
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from 'drizzle-zod';

import { tagsTable } from '../tags/tags.model';
import { postsTable } from './posts.model';

export const postsTagsTable = sqliteTable(
  'posts_tags',
  {
    postId: integer()
      .notNull()
      .references(() => postsTable.id, { onDelete: 'cascade' }),
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
