import { sqliteTable, integer, primaryKey } from 'drizzle-orm/sqlite-core';
import { PostsTable } from './posts';
import { TagsTable } from './tags';

export const PostsTagsTable = sqliteTable(
  'PostsTags',
  {
    postId: integer('postId')
      .notNull()
      .references(() => PostsTable.id),
    tagName: integer('tagName')
      .notNull()
      .references(() => TagsTable.name),
  },
  (table) => ({
    compositePrimaryKey: primaryKey({ columns: [table.postId, table.tagName] }),
  }),
);
