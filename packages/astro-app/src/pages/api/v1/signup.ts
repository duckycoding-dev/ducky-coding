import { lucia } from '@utils/auth/auth';
import { hash } from '@node-rs/argon2';
import { generateIdFromEntropySize } from 'lucia';
import type { APIContext } from 'astro';
import { db } from '@ducky-coding/db/client';
import { UsersTable } from '@ducky-coding/db/models';

export const prerender = false;

export async function POST(context: APIContext): Promise<Response> {
  const formData = await context.request.formData();
  const username = formData.get('username');
  const name = formData.get('name');
  const email = formData.get('email');

  if (!name) return new Response('Missing name', { status: 400 });
  if (!email) return new Response('Missing email', { status: 400 });
  // username must be between 4 ~ 31 characters, and only consists of lowercase letters, 0-9, -, and _
  // keep in mind some database (e.g. mysql) are case insensitive
  if (
    typeof username !== 'string' ||
    username.length < 3 ||
    username.length > 31 ||
    !/^[a-z0-9_-]+$/.test(username)
  ) {
    return new Response('Invalid username', {
      status: 400,
    });
  }
  const password = formData.get('password');
  if (
    typeof password !== 'string' ||
    password.length < 6 ||
    password.length > 255
  ) {
    return new Response('Invalid password', {
      status: 400,
    });
  }

  // const userId = generateIdFromEntropySize(10); // 16 characters long
  const passwordHash = await hash(password, {
    // recommended minimum parameters
    memoryCost: 19456,
    timeCost: 2,
    outputLen: 32,
    parallelism: 1,
  });

  // TODO: check if username is already used
  const [newUser] = await db
    .insert(UsersTable)
    .values({
      // id: userId,
      username,
      password: passwordHash,
      email: email.toString(),
      name: name.toString(),
    })
    .returning();

  const session = await lucia.createSession(newUser.id, {});
  const sessionCookie = lucia.createSessionCookie(session.id);
  context.cookies.set(
    sessionCookie.name,
    sessionCookie.value,
    sessionCookie.attributes,
  );

  return context.redirect('/');
}
