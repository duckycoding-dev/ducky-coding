import { type z } from 'zod';
import { sql } from 'drizzle-orm';
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from 'drizzle-zod';

import { imagesTable } from '../images/images.model';

const currentTimestampMillisSQL = sql`(CAST(ROUND((julianday('now') - 2440587.5) * 86400000) AS INTEGER))`;

export const memesTable = sqliteTable('memes', {
  id: integer().primaryKey({ autoIncrement: true }),
  slug: text().notNull().unique(),
  title: text().notNull(),
  author: text().notNull().default('DuckyCoding'),
  imagePath: text()
    .notNull()
    .references(() => imagesTable.path),
  imageAlt: text().notNull(),
  tags: text().notNull().default('[]'), // JSON-serialized string[]
  createdAt: integer({ mode: 'number' })
    .notNull()
    .default(currentTimestampMillisSQL),
});

export const memeSchema = createSelectSchema(memesTable);
export const insertMemeSchema = createInsertSchema(memesTable);
export const updateMemeSchema = createUpdateSchema(memesTable);
export type Meme = z.infer<typeof memeSchema>;
export type InsertMeme = z.infer<typeof insertMemeSchema>;
export type UpdateMeme = z.infer<typeof updateMemeSchema>;
