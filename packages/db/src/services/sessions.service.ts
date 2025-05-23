import type { SessionDTO } from '@ducky-coding/types/DTOs';
import { SessionsRepository } from '../repositories/sessions.repository';
import type { InsertSession } from '../models';
import { logger } from '../utils/logger';

const getSessionByRefreshToken = async (
  sessionTitle: string,
): Promise<SessionDTO | undefined> => {
  const selectedSessions = await SessionsRepository.getSessions([sessionTitle]);
  return selectedSessions[0];
};

const getSessionByRefreshTokenAndUserId = async (
  sessionTitle: string,
  userId: number,
): Promise<SessionDTO | undefined> => {
  const selectedSessions =
    await SessionsRepository.getSessionByRefreshTokenAndUserId(
      sessionTitle,
      userId,
    );
  if (selectedSessions.length === 0) return undefined;
  return selectedSessions[0];
};

const insertSession = async (
  session: InsertSession,
): Promise<SessionDTO | undefined> => {
  const insertedSessions = await SessionsRepository.insertSessions([session]);
  if (insertedSessions.length === 0) return undefined;
  return insertedSessions[0];
};

const updateSession = async (
  session: SessionDTO,
): Promise<SessionDTO | undefined> => {
  const updatedSession = await SessionsRepository.updateSession(session);
  return updatedSession;
};

const deleteSessions = async (
  refreshTokens: string[],
): Promise<SessionDTO[]> => {
  const deletedSessions =
    await SessionsRepository.deleteSessions(refreshTokens);
  return deletedSessions;
};

const deleteAllUserSessions = async (userId: number): Promise<SessionDTO[]> => {
  const deletedSessions =
    await SessionsRepository.deleteAllUserSessions(userId);
  return deletedSessions;
};

const deleteExpiredSessions = async (): Promise<SessionDTO[]> => {
  const deletedSessions = await SessionsRepository.deleteExpiredSessions();
  return deletedSessions;
};

// since this file is a module, this is a private variable that will be shared across all calls to this module, acting as a singleton.
let lastCleanup: number = 0;
const cleanupInterval = 1000 * 60 * 60 * 24; // 1 day
/**
 * Deletes all sessions that have expired: this triggers at intervals (interval defined by cleanupInterval in this same module).
 * Used when verifying tokens or refreshing tokens allows us to soft clean the session table every once in a while, to avoid having a large table with stale data.
 */
const cleanupSessionsTableRegularly = async () => {
  const now = Date.now();
  if (now - lastCleanup > cleanupInterval) {
    await deleteExpiredSessions();
    lastCleanup = now;
    logger.log('Cleaned sessions at: ', lastCleanup);
  }
};

export const SessionsService = {
  getSessionByRefreshToken,
  getSessionByRefreshTokenAndUserId,
  insertSession,
  updateSession,
  deleteSessions,
  deleteAllUserSessions,
  deleteExpiredSessions,
  cleanupSessionsTableRegularly,
};
