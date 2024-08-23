import { AuthService, SessionsService } from '@ducky-coding/db/services';
import type { APIRoute } from 'astro';
import { getTokens } from '@utils/auth/auth';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  const existingTokens = getTokens(request.headers);
  const { searchParams } = new URL(request.url);
  let redirectToParam = searchParams.get('redirectTo');
  let redirectTo = '/';

  if (redirectToParam) {
    if (!redirectToParam.startsWith('/')) {
      redirectToParam = `/${redirectToParam}`;
    }
    if (
      redirectToParam.startsWith('/login') ||
      redirectToParam.startsWith('/signup')
    ) {
      redirectToParam = '/';
    }
    redirectTo = redirectToParam;
  }

  if (existingTokens.refreshToken) {
    const headers = new Headers();
    headers.append('Location', redirectTo);
    return new Response(JSON.stringify({ message: 'User already logged in' }), {
      status: 303,
      headers,
    });
  }

  const data = await request.formData();
  const username = data.get('username')?.toString();
  const password = data.get('password')?.toString();

  if (!username || !password) {
    return new Response(
      JSON.stringify({
        message: `Missing ${!username ? 'username' : 'password'}`,
      }),
      {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      },
    );
  }

  const user = await AuthService.validateUser(username, password);

  if (user) {
    const { accessToken, refreshToken } = AuthService.generateTokens(user);
    const session = await SessionsService.insertSession({
      expiresAt: Date.now() + 604800000,
      refreshToken,
      userId: user.id,
    });

    if (!session)
      return new Response(
        JSON.stringify({ message: 'Failed to create session' }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        },
      );

    const headers = new Headers();
    headers.set('Content-Type', 'application/json');
    headers.append(
      'Set-Cookie',
      `accessToken=${accessToken}; HttpOnly; Path=/; Expires=${new Date(Date.now() + 900000).toUTCString()}`,
    );
    headers.append(
      'Set-Cookie',
      `refreshToken=${refreshToken}; HttpOnly; Path=/; Expires=${new Date(session.expiresAt).toUTCString()}`,
    );

    headers.append('Location', redirectTo);

    return new Response(JSON.stringify({ message: 'Successfully logged in' }), {
      status: 303,
      headers,
    });
  }

  return new Response(JSON.stringify({ message: 'Invalid credentials' }), {
    status: 403,
    headers: { 'Content-Type': 'application/json' },
  });
};
