import z from 'zod';
import { ImageDTOSchema } from './image.dto';

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

export const UserWithProfilePictureDTOSchema = UserDTOSchema.extend({
  profilePicture: ImageDTOSchema.optional(),
}).omit({ profilePictureId: true });
export type UserWithProfilePictureDTO = z.infer<
  typeof UserWithProfilePictureDTOSchema
>;
