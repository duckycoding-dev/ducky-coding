import { AuthService } from '@ducky-coding/db/services';
import type { APIRoute } from 'astro';
import { getTokens } from '@utils/auth/auth';

export const prerender = false;

export const POST: APIRoute = async ({ request, redirect }) => {
  const existingTokens = getTokens(request.headers);
  if (existingTokens.refreshToken) {
    return redirect('/');
  }

  const data = await request.formData();
  const username = data.get('username')?.toString();
  const password = data.get('password')?.toString();
  if (!username)
    return new Response(JSON.stringify({ message: 'Missing username' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' },
    });
  if (!password)
    return new Response(JSON.stringify({ message: 'Missing password' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' },
    });

  const user = await AuthService.validateUser(username, password);

  if (user) {
    const { accessToken, refreshToken } = AuthService.generateTokens(user);
    const headers = new Headers();
    headers.set('Content-Type', 'application/json');
    headers.append(
      'Set-Cookie',
      `accessToken=${accessToken}; HttpOnly; Path=/; Max-Age=900`,
    );
    headers.append(
      'Set-Cookie',
      `refreshToken=${refreshToken}; HttpOnly; Path=/; Max-Age=604800`,
    );

    delete user.password;
    return new Response(
      JSON.stringify({ message: 'Logged in successfully', user }),
      {
        status: 200,
        headers,
      },
    );
  }

  return new Response(JSON.stringify({ message: 'Invalid credentials' }), {
    status: 403,
    headers: { 'Content-Type': 'application/json' },
  });
};
