import { sqliteTable, integer, primaryKey } from 'drizzle-orm/sqlite-core';
import { z } from 'zod';
import type { PostAuthorDTO } from '@ducky-coding/types/DTOs';
import { PostsTable } from './posts.model';
import { UsersTable } from './users.model';

export const PostsAuthorsTable = sqliteTable(
  'postsAuthors',
  {
    postId: integer('postId')
      .notNull()
      .references(() => PostsTable.id),
    authorId: integer('authorId')
      .notNull()
      .references(() => UsersTable.id),
  },
  (table) => ({
    compositePrimaryKey: primaryKey({
      columns: [table.postId, table.authorId],
    }),
  }),
);

export const PostsAuthorsSchema = z.object({
  postId: z.number(),
  autorId: z.number(),
});

export type InsertPostAuthor = typeof PostsAuthorsTable.$inferInsert;
export type PostAuthor = typeof PostsAuthorsTable.$inferSelect;

export function mapToPostAuthorDTO(
  selectedPostAuthor: PostAuthor,
): PostAuthorDTO {
  return {
    postId: selectedPostAuthor.postId,
    authorId: selectedPostAuthor.authorId,
  };
}
