import { UserDTO } from '@ducky-coding/types/DTOs';
import { TokenPair } from '@ducky-coding/types/entities';
import jwt from 'jsonwebtoken';
import { UsersService } from '../services/users.service';

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
  if (!process.env.JWT_SECRET_KEY)
    throw new Error('JWT_SECRET_KEY is not defined');
  const accessToken = jwt.sign(
    { userId: user.id },
    process.env.JWT_SECRET_KEY,
    {
      expiresIn: '15m',
    },
  );
  if (!process.env.REFRESH_JWT_SECRET_KEY)
    throw new Error('REFRESH_JWT_SECRET_KEY is not defined');
  const refreshToken = generateBothTokens
    ? jwt.sign({ userId: user.id }, process.env.REFRESH_JWT_SECRET_KEY, {
        expiresIn: '7d',
      })
    : '';
  return { accessToken, refreshToken };
};

const verifyAccessToken = (accessToken: string): number | null => {
  if (!process.env.JWT_SECRET_KEY)
    throw new Error('JWT_SECRET_KEY is not defined');
  try {
    const decoded = jwt.verify(accessToken, process.env.JWT_SECRET_KEY) as {
      userId: number;
    };
    return decoded.userId;
  } catch (error) {
    console.error('verifyAccessToken error', error);
    return null;
  }
};

const verifyRefreshToken = (refreshToken: string): number | null => {
  if (!process.env.REFRESH_JWT_SECRET_KEY)
    throw new Error('REFRESH_JWT_SECRET_KEY is not defined');
  try {
    const decoded = jwt.verify(
      refreshToken,
      process.env.REFRESH_JWT_SECRET_KEY,
    ) as {
      userId: number;
    };
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
    const userId = verifyRefreshToken(refreshToken);
    if (!userId) return null;

    const user = await UsersService.getUser(userId);
    if (!user) {
      return null;
    }
    return generateTokens(user, refreshBothTokens);
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
