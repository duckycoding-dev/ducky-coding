import { UserDTO } from '@ducky-coding/types/DTOs';
import { text, sqliteTable, integer } from 'drizzle-orm/sqlite-core';
import { z } from 'zod';
import { ImagesTable } from './images.model';

export const UsersTable = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }).unique().notNull(),
  username: text('username').unique().notNull(),
  email: text('email').unique().notNull(),
  password: text('email').notNull(),
  name: text('name').notNull(),
  lastName: text('lastName'),
  profilePictureId: integer('profilePictureId').references(
    () => ImagesTable.id,
  ),
  bio: text('bio'),
  createdAt: integer('createdAt').notNull(),
  deletedAt: integer('deletedAt'),
});

export const UserSchema = z.object({
  id: z.number(),
  username: z.string(),
  email: z.string(),
  name: z.string(),
  lastName: z.string().optional(),
});

export type InsertUser = typeof UsersTable.$inferInsert;
export type User = typeof UsersTable.$inferSelect;

export function mapToUserDTO(selectedUser: User): UserDTO {
  return {
    id: selectedUser.id,
    username: selectedUser.username,
    email: selectedUser.email,
    name: selectedUser.name,
    lastName: selectedUser.lastName ?? undefined,
    profilePictureId: selectedUser.profilePictureId ?? undefined,
    password: selectedUser.password,
    bio: selectedUser.bio ?? undefined,
    createdAt: selectedUser.createdAt,
    deletedAt: selectedUser.deletedAt ?? undefined,
  };
}
