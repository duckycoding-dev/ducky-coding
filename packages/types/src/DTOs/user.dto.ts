import z from 'zod';

export const UserDTOSchema = z.object({
  id: z.number(),
  username: z.string(),
  email: z.string(),
  password: z.string(),
  name: z.string(),
  lastName: z.string().optional(),
  profilePictureId: z.number().optional(),
  bio: z.string().optional(),
  createdAt: z.number(),
  deletedAt: z.number().optional(),
});
export type UserDTO = z.infer<typeof UserDTOSchema>;
