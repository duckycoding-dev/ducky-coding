import { z } from 'zod';

export const ContentStatusSchema = z
  .enum(['draft', 'published', 'deleted'])
  .default('draft');
export type ContentStatus = z.infer<typeof ContentStatusSchema>;

export const PostContentSchema = z.object({
  title: z.string(),
  bannerImage: z.object({
    path: z.string(),
    alt: z.string().optional(),
  }),
  summary: z.string(),
  content: z.string(),
  authors: z
    .array(
      z.object({
        username: z.string(),
      }),
    )
    .min(1),
  topic: z.object({
    title: z.string(),
  }),
  tags: z.array(z.string()).min(1),
  language: z.string().default('en'),
  timeToRead: z.number(),
  status: ContentStatusSchema,
});
export type PostContent = z.infer<typeof PostContentSchema>;
