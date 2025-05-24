import z from 'zod';

export const TagDTOSchema = z.object({
  name: z.string(),
});
export type TagDTO = z.infer<typeof TagDTOSchema>;
