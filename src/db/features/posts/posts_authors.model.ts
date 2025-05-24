import { sqliteTable, integer, primaryKey } from 'drizzle-orm/sqlite-core';
import { z } from 'zod';
import type { PostAuthorDTO } from '@custom-types/DTOs';
import { PostsTable } from './posts.model';
import { UsersTable } from '../users/users.model';

export const PostsAuthorsTable = sqliteTable(
  'posts_authors',
  {
    postId: integer()
      .notNull()
      .references(() => PostsTable.id),
    authorId: integer()
      .notNull()
      .references(() => UsersTable.id),
  },
  (table) => [
    primaryKey({
      columns: [table.postId, table.authorId],
    }),
  ],
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
