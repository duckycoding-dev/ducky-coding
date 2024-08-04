import { sqliteTable, integer, primaryKey } from 'drizzle-orm/sqlite-core';
import { PostsTable } from './posts.model';
import { AuthorsTable } from './authors.model';

export const PostsAuthorsTable = sqliteTable(
  'postsAuthors',
  {
    postId: integer('postId')
      .notNull()
      .references(() => PostsTable.id),
    authorId: integer('authorId')
      .notNull()
      .references(() => AuthorsTable.userId),
  },
  (table) => ({
    compositePrimaryKey: primaryKey({
      columns: [table.postId, table.authorId],
    }),
  }),
);
