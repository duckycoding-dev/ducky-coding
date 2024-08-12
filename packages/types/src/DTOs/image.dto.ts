import { z } from 'zod';

export const BaseImageDTOSchema = z.object({
  id: z.number().optional(),
  path: z.string(),
  alt: z.string().optional(),
});
export type BaseImageDTO = z.infer<typeof BaseImageDTOSchema>;

export const CreateImageDTOSchema = BaseImageDTOSchema.omit({
  id: true,
});
export type CreateImageDTO = z.infer<typeof CreateImageDTOSchema>;

export const ImageDTOSchema = BaseImageDTOSchema.required({ id: true });
export type ImageDTO = z.infer<typeof ImageDTOSchema>;
