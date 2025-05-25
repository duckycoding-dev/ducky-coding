import { sqliteTable, text } from 'drizzle-orm/sqlite-core';
import {
  createSelectSchema,
  createInsertSchema,
  createUpdateSchema,
} from 'drizzle-zod';
import { z } from 'zod';

export const tagsTable = sqliteTable('tags', {
  name: text().primaryKey().unique().notNull(),
});

export const tagSchema = createSelectSchema(tagsTable);
export const insertTagSchema = createInsertSchema(tagsTable);
export const updateTagSchema = createUpdateSchema(tagsTable);

export type Tag = z.infer<typeof tagSchema>;
export type InsertTag = z.infer<typeof insertTagSchema>;
export type UpdateTag = z.infer<typeof updateTagSchema>;
