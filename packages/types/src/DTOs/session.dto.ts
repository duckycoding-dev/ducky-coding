import { z } from 'zod';

export const SessionDTOSchema = z.object({
  id: z.number(),
  userId: z.number(),
  expiresAt: z.number(),
});

export type SessionDTO = z.infer<typeof SessionDTOSchema>;
