import type { UserDTO } from '@custom-types/DTOs';
import { text, sqliteTable, integer } from 'drizzle-orm/sqlite-core';
import { z } from 'zod';
import { sql } from 'drizzle-orm';
import { ImagesTable } from '../images/images.model';

export const UsersTable = sqliteTable('users', {
  id: integer().primaryKey({ autoIncrement: true }).unique().notNull(),
  username: text().unique().notNull(),
  email: text().unique().notNull(),
  password: text().notNull(),
  name: text().notNull(),
  lastName: text(),
  profilePictureId: integer().references(() => ImagesTable.id),
  bio: text('bio'),
  createdAt: integer('createdAt', { mode: 'number' })
    .notNull()
    .default(sql`(strftime('%s', 'now'))`),
  updatedAt: integer('updatedAt', { mode: 'number' })
    .notNull()
    .default(sql`(strftime('%s', 'now'))`),
  deletedAt: integer('deletedAt', { mode: 'number' }),
});

export const UserSchema = z.object({
  id: z.number(),
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
    updatedAt: selectedUser.updatedAt,
    deletedAt: selectedUser.deletedAt ?? undefined,
  };
}
