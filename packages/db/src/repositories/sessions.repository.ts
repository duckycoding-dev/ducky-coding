import { SessionDTO } from '@ducky-coding/types/DTOs';
import { and, eq, inArray, lt } from 'drizzle-orm';
import { InsertSession, mapToSessionDTO, SessionsTable } from '../models';
import { db } from '../client';

const getSessions = async (refreshTokens: string[]): Promise<SessionDTO[]> => {
  const sessions = await db
    .select()
    .from(SessionsTable)
    .where(inArray(SessionsTable.refreshToken, refreshTokens));

  const sessionDTOs: SessionDTO[] = sessions.map((session) => {
    return mapToSessionDTO(session);
  });

  return sessionDTOs;
};

const getSessionByRefreshTokenAndUserId = async (
  refreshToken: string,
  userId: number,
): Promise<SessionDTO[]> => {
  const sessions = await db
    .select()
    .from(SessionsTable)
    .where(
      and(
        eq(SessionsTable.refreshToken, refreshToken),
        eq(SessionsTable.userId, userId),
      ),
    );

  const sessionDTOs: SessionDTO[] = sessions.map((session) => {
    return mapToSessionDTO(session);
  });

  return sessionDTOs;
};

const insertSessions = async (
  sessions: InsertSession[],
): Promise<SessionDTO[]> => {
  const insertedSessions = await db
    .insert(SessionsTable)
    .values(
      sessions.map((session) => {
        return {
          expiresAt: session.expiresAt,
          refreshToken: session.refreshToken,
          userId: session.userId,
        };
      }),
    )
    .returning();

  return insertedSessions.map((insertedSession) =>
    mapToSessionDTO(insertedSession),
  );
};

const updateSession = async (
  session: SessionDTO,
): Promise<SessionDTO | undefined> => {
  const updatedSession = await db
    .update(SessionsTable)
    .set({
      expiresAt: session.expiresAt,
      refreshToken: session.refreshToken,
      userId: session.userId,
      id: session.id,
    })
    .returning();

  if (updatedSession.length === 0) return undefined;
  return mapToSessionDTO(updatedSession[0]);
};

const deleteSessions = async (
  refreshTokens: string[],
): Promise<SessionDTO[]> => {
  const sessions = await db
    .delete(SessionsTable)
    .where(inArray(SessionsTable.refreshToken, refreshTokens))
    .returning();

  const sessionDTOs: SessionDTO[] = sessions.map((session) => {
    return mapToSessionDTO(session);
  });

  return sessionDTOs;
};

const deleteAllUserSessions = async (userId: number): Promise<SessionDTO[]> => {
  const sessions = await db
    .delete(SessionsTable)
    .where(eq(SessionsTable.userId, userId))
    .returning();

  const sessionDTOs: SessionDTO[] = sessions.map((session) => {
    return mapToSessionDTO(session);
  });

  return sessionDTOs;
};

const deleteExpiredSessions = async (): Promise<SessionDTO[]> => {
  const sessions = await db
    .delete(SessionsTable)
    .where(lt(SessionsTable.expiresAt, new Date().getTime()))
    .returning();
  const sessionDTOs: SessionDTO[] = sessions.map((session) => {
    return mapToSessionDTO(session);
  });

  return sessionDTOs;
};

export const SessionsRepository = {
  getSessions,
  getSessionByRefreshTokenAndUserId,
  insertSessions,
  updateSession,
  deleteSessions,
  deleteAllUserSessions,
  deleteExpiredSessions,
};
