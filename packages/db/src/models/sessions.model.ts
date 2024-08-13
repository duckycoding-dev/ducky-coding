import { integer, sqliteTable } from 'drizzle-orm/sqlite-core';
import { z } from 'zod';
import { SessionDTO } from '@ducky-coding/types/DTOs';
import { UsersTable } from './users.model';

export const SessionsTable = sqliteTable('sessions', {
  id: integer('id').notNull().primaryKey(),
  userId: integer('userId')
    .notNull()
    .references(() => UsersTable.id),
  expiresAt: integer('expiresAt', { mode: 'number' }).notNull(),
});

export const SessionSchema = z.object({
  id: z.number(),
  userId: z.number(),
  expiresAt: z.number(),
});

export type InsertSession = typeof SessionsTable.$inferInsert;
export type Session = typeof SessionsTable.$inferSelect;

export function mapToSessionDTO(selectedSession: Session): SessionDTO {
  return {
    id: selectedSession.id,
    userId: selectedSession.userId,
    expiresAt: selectedSession.expiresAt,
  };
}
