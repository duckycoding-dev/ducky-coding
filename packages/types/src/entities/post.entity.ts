import { z } from 'zod';
import { ImageSchema } from './image.entity';
import { TopicSchema } from './topic.entity';
import { AuthorSchema } from './author.entity';

export const ContentStatusSchema = z
  .enum(['draft', 'published', 'deleted'])
  .default('draft');

export const PostContentSchema = z.object({
  title: z.string(),
  bannerImage: ImageSchema,
  summary: z.string().optional(),
  content: z.string(),
  authors: z.array(AuthorSchema).min(1),
  topic: TopicSchema,
  tags: z.array(z.string()).min(1),
  language: z.enum(['en', 'it']).default('en'),
  timeToRead: z.number(),
  status: ContentStatusSchema,
});

export const PostSchema = z.object({
  slug: z.string(),
  title: z.string(),
  bannerImage: ImageSchema,
  summary: z.string().optional(),
  content: z.string(),
  authors: z.array(AuthorSchema).min(1),
  topic: TopicSchema,
  tags: z.array(z.string()).min(1),
  language: z.enum(['en', 'it']).default('en'),
  timeToRead: z.number(),
  status: ContentStatusSchema,
  createdAt: z.date(),
  updatedAt: z.date(),
  publishedAt: z.date().optional(),
  deletedAt: z.date().optional(),
});

export type PostContent = z.infer<typeof PostContentSchema>;
export type Post = z.infer<typeof PostSchema>;
export type ContentStatus = z.infer<typeof ContentStatusSchema>;
