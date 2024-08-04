import { sqliteTable, integer, primaryKey } from 'drizzle-orm/sqlite-core';
import { PostsTable } from '@db/tables/PostsTable/PostsTable';
import { TagsTable } from '@db/tables/TagsTable/TagsTable';

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
