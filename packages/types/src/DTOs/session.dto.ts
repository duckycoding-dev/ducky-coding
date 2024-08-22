import { z } from 'zod';

export const SessionDTOSchema = z.object({
  id: z.number(),
  userId: z.number(),
  refreshToken: z.string(),
  expiresAt: z.number(),
});

export type SessionDTO = z.infer<typeof SessionDTOSchema>;
