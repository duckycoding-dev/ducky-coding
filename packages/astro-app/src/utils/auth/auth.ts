import { AuthService } from '@ducky-coding/db/services';
import type { TokenPair } from '@ducky-coding/types/entities';
import type { APIRoute } from 'astro';

export function getTokens(headers: Headers): Partial<TokenPair> {
  const cookies = headers.get('cookie');
  const accessToken = cookies
    ?.split(';')
    .find((c) => c.trim().startsWith('accessToken='))
    ?.split('=')[1];
  const refreshToken = cookies
    ?.split(';')
    .find((c) => c.trim().startsWith('refreshToken='))
    ?.split('=')[1];

  return { accessToken, refreshToken };
}

export async function validateAccessToBackend(
  headers: Headers,
): Promise<TokenPair> {
  const tokens = getTokens(headers);
  let { accessToken } = tokens;
  const { refreshToken } = tokens;

  if (!accessToken && !refreshToken) {
    throw new Error('User is not logged in');
  }

  if (!refreshToken) {
    // it's the refresh token that authorizes the user, if it's not present, return unauthorized
    throw new Error('Unauthorized');
  }

  if (accessToken) {
    // if the access token is invalid, set it to undefined to force a refresh
    if (AuthService.verifyAccessToken(accessToken) === null) {
      accessToken = undefined;
    }
  }

  if (!accessToken) {
    const newTokens = await AuthService.refreshTokens(refreshToken);
    if (!newTokens) {
      throw new Error('Unauthorized');
    }
    accessToken = newTokens.accessToken;
  }

  return { accessToken, refreshToken };
}

/**
 * Higher-order function that adds authentication middleware to an API route handler.
 *
 * @param handler - The API route handler function.
 * @returns A new API route handler function with authentication middleware.
 */
export const withAuth =
  (handler: APIRoute): APIRoute =>
  async (context) => {
    try {
      const { accessToken, refreshToken } = await validateAccessToBackend(
        context.request.headers,
      );

      const userId = AuthService.verifyAccessToken(accessToken);
      if (!userId) {
        throw new Error('Unauthorized');
      }

      // Add the tokens and userId to the request context for later use in the handler
      context.locals.userId = userId;
      context.locals.tokens = { accessToken, refreshToken };
    } catch (error) {
      const headers = new Headers();
      headers.set('Content-Type', 'application/json');
      if (error instanceof Error) {
        if (error.message === 'Unauthorized') {
          headers.append(
            'Set-Cookie',
            `accessToken=; HttpOnly; Path=/; Max-Age=-1`,
          );
          headers.append(
            'Set-Cookie',
            `refreshToken=; HttpOnly; Path=/; Max-Age=-1`,
          );
        }

        return new Response(JSON.stringify({ message: error.message }), {
          status: 403,
          headers,
        });
      }
      return new Response(
        JSON.stringify({ message: 'INTERNAL_SERVER_ERROR' }),
        {
          status: 500,
          headers,
        },
      );
    }

    try {
      return handler(context);
    } catch (error) {
      console.error('UNHANDLED_SERVER_ERROR', error);
      return new Response(
        JSON.stringify({ message: 'INTERNAL_SERVER_ERROR' }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        },
      );
    }
  };
