import { z } from 'zod';
import { ImageSchema } from './image.entity';

export const TopicSchema = z.object({
  title: z.string(),
  image: ImageSchema,
  slug: z.string(),
});

export type Topic = z.infer<typeof TopicSchema>;
