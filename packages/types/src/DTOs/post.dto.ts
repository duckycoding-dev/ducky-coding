import { z } from 'zod';
import { ImageDTOSchema } from './image.dto';
import { AuthorDTOSchema } from './author.dto';
import { TopicDTOSchema } from './topic.dto';
import { ContentStatusSchema } from '../entities/post.entity';

export const PostDTOSchema = z.object({
  slug: z.string(),
  title: z.string(),
  bannerImage: ImageDTOSchema,
  summary: z.string().optional(),
  content: z.string(),
  authors: z.array(AuthorDTOSchema).min(1),
  topic: TopicDTOSchema,
  tags: z.array(z.string()).min(1),
  language: z.enum(['en', 'it']).default('en'),
  timeToRead: z.number(),
  status: ContentStatusSchema,
  createdAt: z.number(),
  updatedAt: z.number(),
  publishedAt: z.number().optional(),
  deletedAt: z.number().optional(),
});

export type PostDTO = z.infer<typeof PostDTOSchema>;
