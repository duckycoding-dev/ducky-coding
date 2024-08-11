import { z } from 'zod';

export const ImageDTOSchema = z.object({
  id: z.number(),
  path: z.string(),
  alt: z.string().optional(),
});

export type ImageDTO = z.infer<typeof ImageDTOSchema>;
