import { UsersService } from '@ducky-coding/db/services';
import type { APIRoute } from 'astro';
import type { InsertUser } from '@ducky-coding/db/models';
import type { UserDTO } from '@ducky-coding/types/DTOs';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  const data = await request.formData();
  const email = data.get('email')?.toString();
  const username = data.get('username')?.toString();
  const password = data.get('password')?.toString();
  const name = data.get('name')?.toString();
  const lastName = data.get('lastName')?.toString();

  const missingFields: string[] = [];

  if (!email) missingFields.push('email');
  if (!username) missingFields.push('username');
  if (!password) missingFields.push('password');
  if (!name) missingFields.push('name');

  if (missingFields.length > 0) {
    return new Response(
      JSON.stringify({
        message: `Missing required fields: ${missingFields.join(', ')}`,
      }),
      {
        status: 403,
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );
  }

  // for some reasons typescript doesn't pick up the fact that at this point the values are certainly strings and not undefined, that's why I'm using "as string"
  const userToInsert: InsertUser = {
    email: email as string,
    username: username as string,
    name: name as string,
    lastName,
    password: password as string,
  };

  try {
    const user = await UsersService.insertUser(userToInsert);

    if (user) {
      const safeUser: UserDTO = { ...user, password: undefined };
      return new Response(
        JSON.stringify({
          message: 'User successfully created',
          user: safeUser,
        }),
        {
          status: 303,
          headers: {
            'Content-Type': 'application/json',
            Location: `/signedup-successfully?username=${user.username}`,
          },
        },
      );
    }
    return new Response(
      JSON.stringify({
        message: 'Something went wrong creating the user profile',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      },
    );
  } catch (error) {
    let errorMessage = 'Something went wrong creating the user profile';
    if (
      error instanceof Error &&
      error.message.includes(
        'SQLite error: UNIQUE constraint failed: users.email',
      )
    )
      errorMessage = 'Email already in use';
    else if (
      error instanceof Error &&
      error.message.includes(
        'SQLite error: UNIQUE constraint failed: users.username',
      )
    )
      errorMessage = 'Username already in use';

    return new Response(
      JSON.stringify({
        message: errorMessage,
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      },
    );
  }
};
