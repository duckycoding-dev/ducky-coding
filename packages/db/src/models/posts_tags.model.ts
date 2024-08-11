import {
  sqliteTable,
  integer,
  primaryKey,
  text,
} from 'drizzle-orm/sqlite-core';
import { z } from 'zod';
import { PostTagDTO } from '@ducky-coding/types/DTOs';
import { PostsTable } from './posts.model';
import { TagsTable } from './tags.model';

export const PostsTagsTable = sqliteTable(
  'postsTags',
  {
    postId: integer('postId')
      .notNull()
      .references(() => PostsTable.id),
    tagName: text('tagName')
      .notNull()
      .references(() => TagsTable.name),
  },
  (table) => ({
    compositePrimaryKey: primaryKey({ columns: [table.postId, table.tagName] }),
  }),
);

export const PostsTagsSchema = z.object({
  postId: z.number(),
  tagName: z.string(),
});

export type InsertPostTag = typeof PostsTagsTable.$inferInsert;
export type PostTag = typeof PostsTagsTable.$inferSelect;

export function mapToPostTagDTO(selectedPostTag: PostTag): PostTagDTO {
  return {
    postId: selectedPostTag.postId,
    tagName: selectedPostTag.tagName,
  };
}
