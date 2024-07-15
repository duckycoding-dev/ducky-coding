import { text, sqliteTable } from 'drizzle-orm/sqlite-core';

export const {{name}}Table = sqliteTable('{{name}}', {
  columnName: text('columnName').primaryKey().unique().notNull(),
});
