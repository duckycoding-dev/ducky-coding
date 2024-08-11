import { z } from 'zod';
import { ContentStatusSchema } from '../entities/postContent.entity';
import { UserDTOSchema } from './user.dto';
import { ImageDTOSchema } from './image.dto';

export const PostDTOSchema = z.object({
  id: z.number(),
  slug: z.string(),
  title: z.string(),
  bannerImageId: z.number().optional(),
  summary: z.string().optional(),
  content: z.string(),
  // authorsIds: z.array(z.number()).min(1),
  topicTitle: z.string(),
  // tags: z.array(z.string()).min(1),
  language: z.string().default('en'),
  timeToRead: z.number(),
  status: ContentStatusSchema,
  createdAt: z.number(),
  updatedAt: z.number(),
  publishedAt: z.number().optional(),
  deletedAt: z.number().optional(),
});
export type PostDTO = z.infer<typeof PostDTOSchema>;
export const PostAuthorDTOSchema = z.object({
  postId: z.number(),
  authorId: z.number(),
});
export type PostAuthorDTO = z.infer<typeof PostAuthorDTOSchema>;

export const PostTagDTOSchema = z.object({
  postId: z.number(),
  tagName: z.string(),
});
export type PostTagDTO = z.infer<typeof PostTagDTOSchema>;

export const PostWithAuthorAndBannerImageDTOSchema = PostDTOSchema.extend({
  authors: UserDTOSchema.array().min(1),
  bannerImage: ImageDTOSchema.optional(),
}).omit({ bannerImageId: true });

export type PostWithAuthorAndBannerImageDTO = z.infer<
  typeof PostWithAuthorAndBannerImageDTOSchema
>;
