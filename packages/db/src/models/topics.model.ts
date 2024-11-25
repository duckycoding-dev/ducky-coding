import { integer, text, sqliteTable } from 'drizzle-orm/sqlite-core';
import { z } from 'zod';
import type { TopicDTO } from '@ducky-coding/types/DTOs';
import { TagsTable } from './tags.model';
import { ImagesTable } from './images.model';

export const TopicsTable = sqliteTable('topics', {
  title: text('title')
    .primaryKey()
    .unique()
    .notNull()
    .references(() => TagsTable.name),
  slug: text('slug').unique().notNull(),
  imageId: integer('imageId').references(() => ImagesTable.id),
});

export const TopicSchema = z.object({
  title: z.string(),
  slug: z.string(),
  imageId: z.number().nullable(),
});

export type InsertTopic = typeof TopicsTable.$inferInsert;
export type Topic = typeof TopicsTable.$inferSelect; // we defined the entity type as what is selectable from the table, which reflects both TopicsTable and TopicSchema: would be nice if we could create the TopicSchema directly from the TopcisTable definition using drizzle-zod, but this is not currently working

export function mapToTopicDTO(selectedTopic: Topic): TopicDTO {
  return {
    title: selectedTopic.title,
    imageId: selectedTopic.imageId ?? undefined,
    slug: selectedTopic.slug,
  };
}
