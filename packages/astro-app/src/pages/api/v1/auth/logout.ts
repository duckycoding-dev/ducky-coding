import { SessionsService } from '@ducky-coding/db/services';
import type { APIRoute } from 'astro';
import { withAuth } from '@utils/auth/auth';
import type { SessionDTO } from '@ducky-coding/types/DTOs';

export const prerender = false;

export const GET: APIRoute = withAuth(async ({ request, locals }) => {
  const url = new URL(request.url);
  const logoutFromEveryDevice = url.searchParams.get('fromEveryDevice');
  const { userId, tokens: existingTokens } = locals;

  try {
    let deletedSessions: SessionDTO[] = [];
    if (!logoutFromEveryDevice) {
      deletedSessions = await SessionsService.deleteSessions([
        existingTokens.refreshToken,
      ]);
    } else {
      deletedSessions = await SessionsService.deleteAllUserSessions(userId);
    }
    if (deletedSessions.length === 0) {
      return new Response(JSON.stringify({ message: 'Failed to logout' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  } catch (error) {
    return new Response(JSON.stringify({ message: 'Failed to logout' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const headers = new Headers();
  headers.set('Content-Type', 'application/json');
  headers.append('Set-Cookie', `accessToken=; HttpOnly; Path=/; Max-Age=-1`);
  headers.append('Set-Cookie', `refreshToken=; HttpOnly; Path=/; Max-Age=-1`);
  return new Response(JSON.stringify({ message: 'Sucessfully logged out' }), {
    status: 200,
    headers,
  });
});
