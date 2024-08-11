import { z } from 'zod';
import { ImageDTOSchema } from '../DTOs/image.dto';
import { TopicDTOSchema } from '../DTOs';
import { AuthorDTOSchema } from '../DTOs/author.dto';

export const ContentStatusSchema = z
  .enum(['draft', 'published', 'deleted'])
  .default('draft');
export type ContentStatus = z.infer<typeof ContentStatusSchema>;

export const PostContentSchema = z.object({
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
});
export type PostContent = z.infer<typeof PostContentSchema>;
