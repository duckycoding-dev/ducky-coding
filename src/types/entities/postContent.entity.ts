import { z } from 'astro:content';

const ContentStatusSchema = z
  .enum(['draft', 'published', 'deleted'])
  .default('draft');

export const PostContentSchema = z.object({
  title: z.string().min(1),
  bannerImagePath: z.string().optional(),
  summary: z.string().min(1),
  content: z.string().min(1),
  author: z.string().min(1).default('DuckyCoding'),
  topicTitle: z.string().min(1),
  language: z.string().min(1).default('en'),
  timeToRead: z.number().int().min(1).default(1), // value representing minutes
  status: ContentStatusSchema,
  tags: z.array(z.string()).min(1),
  isFeatured: z.boolean().default(false),
});

export type PostContent = z.infer<typeof PostContentSchema>;
