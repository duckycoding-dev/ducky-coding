import { sqliteTable, integer, primaryKey } from 'drizzle-orm/sqlite-core';
import { PostsTable } from './posts';
import { AuthorsTable } from './authors';

export const PostsAuthorsTable = sqliteTable(
  'PostsAuthors',
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
