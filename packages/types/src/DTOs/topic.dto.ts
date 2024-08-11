import { z } from 'zod';
import { ImageDTOSchema } from './image.dto';

export const TopicDTOSchema = z.object({
  title: z.string(),
  slug: z.string(),
  imageId: z.number().optional(),
});
export type TopicDTO = z.infer<typeof TopicDTOSchema>;

export const TopicWithImageDTOSchema = z.object({
  title: z.string(),
  slug: z.string(),
  image: ImageDTOSchema.optional(),
});
export type TopicWithImageDTO = z.infer<typeof TopicWithImageDTOSchema>;
