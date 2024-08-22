import { UserDTO } from '@ducky-coding/types/DTOs';
import { TokenPair } from '@ducky-coding/types/entities';
import jwt from 'jsonwebtoken';
import { UsersService } from '../services/users.service';
import { envs } from '../utils/env';
import { SessionsService } from './sessions.service';

const validateUser = async (
  username: string,
  password: string,
): Promise<UserDTO | null> => {
  const user = await UsersService.getUserByUsername(username);
  if (user && user.password === password) {
    return user;
  }
  return null;
};

const generateTokens = (
  user: UserDTO,
  generateBothTokens = true,
): TokenPair => {
  const accessToken = jwt.sign({ userId: user.id }, envs.JWT_SECRET_KEY, {
    expiresIn: '15m',
  });
  const refreshToken = generateBothTokens
    ? jwt.sign({ userId: user.id }, envs.REFRESH_JWT_SECRET_KEY, {
        expiresIn: '7d',
      })
    : '';
  return { accessToken, refreshToken };
};

const verifyAccessToken = (accessToken: string): number | null => {
  try {
    const decoded = jwt.verify(accessToken, envs.JWT_SECRET_KEY) as {
      userId: number;
    };
    return decoded.userId;
  } catch (error) {
    console.error('verifyAccessToken error', error);
    return null;
  }
};

const verifyRefreshToken = async (
  refreshToken: string,
): Promise<number | null> => {
  try {
    const decoded = jwt.verify(refreshToken, envs.REFRESH_JWT_SECRET_KEY) as {
      userId: number;
    };
    SessionsService.cleanupSessionsTableRegularly();
    const dbSession = await SessionsService.getSessionByRefreshTokenAndUserId(
      refreshToken,
      decoded.userId,
    );
    if (!dbSession) throw new Error('Session not found');
    return decoded.userId;
  } catch (error) {
    console.error('verifyRefreshToken error', error);
    return null;
  }
};

const refreshTokens = async (
  refreshToken: string,
  refreshBothTokens = false,
): Promise<TokenPair | null> => {
  try {
    const userId = await verifyRefreshToken(refreshToken);
    if (!userId) return null;

    const user = await UsersService.getUser(userId);
    if (!user) {
      return null;
    }
    const tokens = generateTokens(user, refreshBothTokens);
    return tokens;
  } catch (error) {
    console.error('refreshToken error', error);
    return null;
  }
};

export const AuthService = {
  validateUser,
  generateTokens,
  verifyAccessToken,
  verifyRefreshToken,
  refreshTokens,
};
