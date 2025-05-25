import { text, sqliteTable, integer } from 'drizzle-orm/sqlite-core';
import {
  createSelectSchema,
  createInsertSchema,
  createUpdateSchema,
} from 'drizzle-zod';
import { z } from 'zod';

export const imagesTable = sqliteTable('images', {
  id: integer().primaryKey({ autoIncrement: true }),
  path: text().notNull().unique(), // Relative path from src/assets/images
  alt: text(),
  // credits: text('credits'), // TODO Possible text to add if needed, to give credit to the creator / original publisher of the image
});

export const imageSchema = createSelectSchema(imagesTable);
export const insertImageSchema = createInsertSchema(imagesTable);
export const updateImageSchema = createUpdateSchema(imagesTable);
export type Image = z.infer<typeof imageSchema>;
export type InsertImage = z.infer<typeof insertImageSchema>;
export type UpdateImage = z.infer<typeof updateImageSchema>;
