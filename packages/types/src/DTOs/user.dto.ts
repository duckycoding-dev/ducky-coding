import z from 'zod';
import { ImageDTOSchema } from './image.dto';

export const BaseUserDTOSchema = z.object({
  id: z.number().optional(),
  username: z.string(),
  email: z.string(),
  password: z.string(),
  name: z.string(),
  lastName: z.string().optional(),
  profilePictureId: z.number().optional(),
  bio: z.string().optional(),
  createdAt: z.number(),
  updatedAt: z.number(),
  deletedAt: z.number().optional(),
});
export type BaseUserDTO = z.infer<typeof BaseUserDTOSchema>;
export const CreateUserDTOSchema = BaseUserDTOSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
});
export type CreateUserDTO = z.infer<typeof CreateUserDTOSchema>;
export const UserDTOSchema = BaseUserDTOSchema.required({ id: true });
export type UserDTO = z.infer<typeof UserDTOSchema>;

export const UserWithProfilePictureDTOSchema = UserDTOSchema.extend({
  profilePicture: ImageDTOSchema.optional(),
}).omit({ profilePictureId: true });
export type UserWithProfilePictureDTO = z.infer<
  typeof UserWithProfilePictureDTOSchema
>;
