import { text, sqliteTable, integer } from 'drizzle-orm/sqlite-core';

export const ImagesTable = sqliteTable('images', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  alt: text('alt'),
  path: text('path').notNull().unique(), // Relative path from src/assets/images
  // credits: text('credits'), // TODO Possible text to add if needed, to give credit to the creator / original publisher of the image
});
