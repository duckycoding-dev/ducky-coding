import { z } from 'zod';
import { text, sqliteTable, integer } from 'drizzle-orm/sqlite-core';
import type { ImageDTO } from '@ducky-coding/types/DTOs';

export const ImagesTable = sqliteTable('images', {
  id: integer().primaryKey({ autoIncrement: true }),
  path: text().notNull().unique(), // Relative path from src/assets/images
  alt: text(),
  // credits: text('credits'), // TODO Possible text to add if needed, to give credit to the creator / original publisher of the image
});

export const ImageSchema = z.object({
  id: z.number(),
  path: z.string(),
  alt: z.string().optional(),
});

export type InsertImage = typeof ImagesTable.$inferInsert;
export type Image = typeof ImagesTable.$inferSelect;

export function mapToImageDTO(selectedImage: Image): ImageDTO {
  return {
    id: selectedImage.id,
    path: selectedImage.path,
    alt: selectedImage.alt ?? undefined,
  };
}
