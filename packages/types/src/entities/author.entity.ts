import { z } from 'zod';

export const AuthorSchema = z.object({
  name: z.string(),
  id: z.string(),
});

export type Author = z.infer<typeof AuthorSchema>;
