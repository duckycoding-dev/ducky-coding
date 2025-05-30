import { text, sqliteTable, integer } from 'drizzle-orm/sqlite-core';
import { tagsTable } from '../tags/tags.model';
import { imagesTable } from '../images/images.model';
import {
  createSelectSchema,
  createInsertSchema,
  createUpdateSchema,
} from 'drizzle-zod';
import { z } from 'zod';

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
  postCount: integer().default(0),
  lastPostDate: integer(), // Timestamp of last post in this topic
  // Timestamps
  createdAt: integer().default(Date.now()),
  updatedAt: integer().default(Date.now()),
});

export const topicSchema = createSelectSchema(topicsTable);
export const insertTopic = createInsertSchema(topicsTable);
export const updateTopic = createUpdateSchema(topicsTable);

export type Topic = z.infer<typeof insertTopic>;
export type InsertTopic = z.infer<typeof insertTopic>;
export type UpdateTopic = z.infer<typeof updateTopic>;
