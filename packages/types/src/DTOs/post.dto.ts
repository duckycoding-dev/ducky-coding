import { z } from 'zod';
import { ContentStatusSchema } from '../entities/postContent.entity';
import { UserDTOSchema } from './user.dto';
import { ImageDTOSchema } from './image.dto';

export const BasePostDTOSchema = z.object({
  id: z.number().optional(),
  slug: z.string(),
  title: z.string(),
  bannerImageId: z.number().optional(),
  summary: z.string(),
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
export type BasePostDTO = z.infer<typeof BasePostDTOSchema>;

const CreatePostDTOSchema = BasePostDTOSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
});
export type CreatePostDTO = z.infer<typeof CreatePostDTOSchema>;

export const PostDTOSchema = BasePostDTOSchema.required({ id: true });
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

export const PostWithAuthorAndBannerImageAndTagsDTOSchema =
  PostWithAuthorAndBannerImageDTOSchema.extend({
    tags: z.array(z.string()).min(1),
  });
export type PostWithAuthorAndBannerImageAndTagsDTO = z.infer<
  typeof PostWithAuthorAndBannerImageAndTagsDTOSchema
>;
