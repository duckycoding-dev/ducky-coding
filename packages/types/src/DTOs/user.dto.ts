import z from 'zod';
import { ImageDTOSchema } from './image.dto';

export const BaseUserDTOSchema = z.object({
  id: z.number().optional(),
  username: z
    .string({ message: 'Username is required' })
    .min(2, 'Username must be at least 2 characters long'),
  email: z.string().email('Email is required'),
  password: z.string().optional(),
  name: z.string({ message: 'Name is required' }),
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
  password: true,
})
  .extend({
    password: z
      .string({ message: 'Password is required' })
      .min(8, 'Password must be at least 8 characters long'),
    repeatPassword: z
      .string({ message: 'Repeat password is required' })
      .min(8, 'Password must be at least 8 characters long'),
  })
  .refine((fields) => fields.password === fields.repeatPassword, {
    message: "Passwords don't match",
    path: ['repeatPassword'],
  });
export type CreateUserDTO = z.infer<typeof CreateUserDTOSchema>;

export const UserDTOSchema = BaseUserDTOSchema.required({
  id: true,
});
export type UserDTO = z.infer<typeof UserDTOSchema>;

export const UserWithProfilePictureDTOSchema = UserDTOSchema.extend({
  profilePicture: ImageDTOSchema.optional(),
}).omit({ profilePictureId: true });
export type UserWithProfilePictureDTO = z.infer<
  typeof UserWithProfilePictureDTOSchema
>;
