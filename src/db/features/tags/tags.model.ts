import type { TagDTO } from '@custom-types/DTOs';
import { sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { z } from 'zod';

export const TagsTable = sqliteTable('tags', {
  name: text().primaryKey().unique().notNull(),
});

export type InsertTag = typeof TagsTable.$inferInsert;
export type Tag = typeof TagsTable.$inferSelect;

export const TagSchema = z.object({
  name: z.string(),
});

export function mapToTagDTO(selectedTag: Tag): TagDTO {
  return {
    name: selectedTag.name,
  };
}
