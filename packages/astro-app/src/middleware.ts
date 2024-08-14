import { defineMiddleware } from 'astro:middleware';
import { lucia } from '@utils/auth/auth';

const FORBIDDEN_PATHS_FOR_LOGGED_USERS = new Set(['/login', '/signup']);

export const onRequest = defineMiddleware(async (context, next) => {
  const sessionId = context.cookies.get(lucia.sessionCookieName)?.value ?? null;

  if (
    !sessionId &&
    !context.url.pathname.startsWith('/api/') &&
    !FORBIDDEN_PATHS_FOR_LOGGED_USERS.has(context.url.pathname)
  ) {
    return context.redirect('/login');
  }

  if (!sessionId) {
    context.locals.user = null;
    context.locals.session = null;
    return next();
  }

  if (sessionId && FORBIDDEN_PATHS_FOR_LOGGED_USERS.has(context.url.pathname)) {
    return context.redirect('/');
  }

  const { session, user } = await lucia.validateSession(sessionId);
  if (session && session.fresh) {
    const sessionCookie = lucia.createSessionCookie(session.id);
    context.cookies.set(
      sessionCookie.name,
      sessionCookie.value,
      sessionCookie.attributes,
    );
  }
  if (!session) {
    const sessionCookie = lucia.createBlankSessionCookie();
    context.cookies.set(
      sessionCookie.name,
      sessionCookie.value,
      sessionCookie.attributes,
    );
  }
  context.locals.session = session;
  context.locals.user = user;
  return next();
});
