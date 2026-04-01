import { type z } from 'zod';
import { sqliteTable, text } from 'drizzle-orm/sqlite-core';
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from 'drizzle-zod';

export const tagsTable = sqliteTable('tags', {
  name: text().primaryKey().unique().notNull(),
});

export const tagSchema = createSelectSchema(tagsTable);
export const insertTagSchema = createInsertSchema(tagsTable);
export const updateTagSchema = createUpdateSchema(tagsTable);

export type Tag = z.infer<typeof tagSchema>;
export type InsertTag = z.infer<typeof insertTagSchema>;
export type UpdateTag = z.infer<typeof updateTagSchema>;
