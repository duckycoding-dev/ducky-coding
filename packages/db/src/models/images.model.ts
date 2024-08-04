import { text, sqliteTable, integer } from 'drizzle-orm/sqlite-core';

export const ImagesTable = sqliteTable('images', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  filename: text('filename').notNull(),
  alt: text('alt'),
  context: text('context').notNull(), // e.g., 'post', 'topic', 'general'
  path: text('path').notNull(), // Relative path from src/assets/images
});
