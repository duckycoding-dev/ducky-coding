import type { APIRoute } from 'astro';
import { withAuth } from '@utils/auth/auth';
import { UsersService } from '@ducky-coding/db/services';

export const prerender = false;

export const GET: APIRoute = withAuth(async ({ locals }) => {
  const { tokens, userId } = locals;

  // removes the access token and refresh token from the cookies if the userId is not present
  if (!userId) {
    const headers = new Headers();
    headers.set('Content-Type', 'application/json');
    headers.append('Set-Cookie', `accessToken=; HttpOnly; Path=/; Max-Age=-1`);
    headers.append('Set-Cookie', `refreshToken=; HttpOnly; Path=/; Max-Age=-1`);
    return new Response(JSON.stringify({ message: 'Unauthorized' }), {
      status: 403,
      headers,
    });
  }

  // removes the access token and refresh token from the cookies if the user is not found (eg. maybe the user was deleted from the database)
  const user = await UsersService.getUserWithProfilePicture(userId);
  if (!user) {
    const headers = new Headers();
    headers.set('Content-Type', 'application/json');
    headers.append('Set-Cookie', `accessToken=; HttpOnly; Path=/; Max-Age=-1`);
    headers.append('Set-Cookie', `refreshToken=; HttpOnly; Path=/; Max-Age=-1`);
    return new Response(JSON.stringify({ message: 'User not found' }), {
      status: 404,
      headers,
    });
  }

  // only refreshes the access token, not the refresh token

  const newExpiration = new Date(Date.now() + 900000).toUTCString();
  const headers = new Headers();
  headers.set('Content-Type', 'application/json');
  headers.append(
    'Set-Cookie',
    `accessToken=${tokens.accessToken}; HttpOnly; Path=/; Expires=${newExpiration}`,
  );

  const userData = {
    id: user.id,
    username: user.username,
    profilePicture: JSON.stringify(user.profilePicture),
  };

  return new Response(
    JSON.stringify({
      user: userData,
      sessionExpiresAt: newExpiration,
    }),
    {
      status: 200,
      headers,
    },
  );
});
