import { z } from 'zod';

export const SessionDTOSchema = z.object({
  id: z.string(),
  userId: z.number(),
  expiresAt: z.number(),
});

export type SessionDTO = z.infer<typeof SessionDTOSchema>;
