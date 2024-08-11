import { TagDTO } from '@ducky-coding/types/DTOs';
import { sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const TagsTable = sqliteTable('tags', {
  name: text('name').primaryKey().unique().notNull(),
});

export type InsertTag = typeof TagsTable.$inferInsert;
export type Tag = typeof TagsTable.$inferSelect;

export function mapToTagDTO(selectedTag: Tag): TagDTO {
  return {
    name: selectedTag.name,
  };
}
