import { type z } from 'zod';
import { sqliteTable, text } from 'drizzle-orm/sqlite-core';
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from 'drizzle-zod';

export const imagesTable = sqliteTable('images', {
  path: text().primaryKey(), // Relative path from src/assets/images
  alt: text(),
  // credits: text('credits'), // TODO Possible text to add if needed, to give credit to the creator / original publisher of the image
});

export const imageSchema = createSelectSchema(imagesTable);
export const insertImageSchema = createInsertSchema(imagesTable);
export const updateImageSchema = createUpdateSchema(imagesTable);
export type Image = z.infer<typeof imageSchema>;
export type InsertImage = z.infer<typeof insertImageSchema>;
export type UpdateImage = z.infer<typeof updateImageSchema>;
