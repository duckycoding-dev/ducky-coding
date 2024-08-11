import { z } from 'zod';

export const AuthorDTOSchema = z.object({
  userId: z.string(),
  bio: z.string().optional(),
});

export type AuthorDTO = z.infer<typeof AuthorDTOSchema>;
