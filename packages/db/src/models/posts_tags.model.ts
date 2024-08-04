import { sqliteTable, integer, primaryKey } from 'drizzle-orm/sqlite-core';
import { PostsTable } from './posts.model';
import { TagsTable } from './tags.model';

export const PostsTagsTable = sqliteTable(
  'postsTags',
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
