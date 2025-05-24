import { z } from 'zod';
import { ImageDTOSchema } from './image.dto';

export const TopicDTOSchema = z.object({
  title: z.string(),
  slug: z.string(),
  imageId: z.number().optional(),
});
export type TopicDTO = z.infer<typeof TopicDTOSchema>;

export const TopicWithImageDTOSchema = TopicDTOSchema.extend({
  image: ImageDTOSchema.optional(),
}).omit({ imageId: true });

export type TopicWithImageDTO = z.infer<typeof TopicWithImageDTOSchema>;
