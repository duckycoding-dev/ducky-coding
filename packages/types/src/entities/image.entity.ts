import { z } from 'zod';

export const ImageSchema = z.object({
  filename: z.string(),
  alt: z.string(),
});

export type Image = z.infer<typeof ImageSchema>;
