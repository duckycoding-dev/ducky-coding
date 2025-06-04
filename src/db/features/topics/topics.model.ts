import { text, sqliteTable, integer } from 'drizzle-orm/sqlite-core';
import { tagsTable } from '../tags/tags.model';
import { imagesTable } from '../images/images.model';
import {
  createSelectSchema,
  createInsertSchema,
  createUpdateSchema,
} from 'drizzle-zod';
import { z } from 'zod';
import { sql } from 'drizzle-orm';

// This SQLite expression calculates the current Unix timestamp in milliseconds.
const currentTimestampMillisSQL = sql`(CAST(ROUND((julianday('now') - 2440587.5) * 86400000) AS INTEGER))`;

export const topicsTable = sqliteTable('topics', {
  title: text()
    .primaryKey()
    .unique()
    .notNull()
    .references(() => tagsTable.name),
  slug: text().unique().notNull(),
  imagePath: text().references(() => imagesTable.path),
  // Enhanced metadata fields
  description: text(),
  backgroundGradient: text(), // Tailwind gradient classes
  externalLink: text(),
  // Analytics fields
  postCount: integer().notNull().default(0),
  lastPostDate: integer(), // Timestamp of last post in this topic
  // Timestamps
  createdAt: integer().notNull().default(currentTimestampMillisSQL),
  updatedAt: integer().notNull().default(currentTimestampMillisSQL),
});

export const topicSchema = createSelectSchema(topicsTable);
export const insertTopic = createInsertSchema(topicsTable);
export const updateTopic = createUpdateSchema(topicsTable);

export type Topic = z.infer<typeof insertTopic>;
export type InsertTopic = z.infer<typeof insertTopic>;
export type UpdateTopic = z.infer<typeof updateTopic>;
