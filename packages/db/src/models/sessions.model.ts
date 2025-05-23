import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { z } from 'zod';
import type { SessionDTO } from '@ducky-coding/types/DTOs';
import { UsersTable } from './users.model';

// TODO: could add more fields such as IP, user agent, etc.

export const SessionsTable = sqliteTable('sessions', {
  id: integer().notNull().primaryKey(),
  userId: integer()
    .notNull()
    .references(() => UsersTable.id),
  refreshToken: text().notNull(),
  expiresAt: integer({ mode: 'number' }).notNull(),
});

export const SessionSchema = z.object({
  id: z.number(),
  userId: z.number(),
  refreshToken: z.string(),
  expiresAt: z.number(),
});

export type InsertSession = typeof SessionsTable.$inferInsert;
export type Session = typeof SessionsTable.$inferSelect;

export function mapToSessionDTO(selectedSession: Session): SessionDTO {
  return {
    id: selectedSession.id,
    userId: selectedSession.userId,
    refreshToken: selectedSession.refreshToken,
    expiresAt: selectedSession.expiresAt,
  };
}
