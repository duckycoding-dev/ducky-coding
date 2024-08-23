import { UsersService } from '@ducky-coding/db/services';
import type { APIRoute } from 'astro';

export const prerender = false;

export const GET: APIRoute = async ({ request }) => {
  const { searchParams } = new URL(request.url);
  const searchParam = searchParams.keys();
  const field = searchParam.next().value;
  const value = searchParams.get(field);
  if (!field || !value) {
    return new Response(
      JSON.stringify({ message: 'Query param expected with value' }),
      {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      },
    );
  }

  const userIsFound = await UsersService.findUserByField({ field, value });

  if (userIsFound) {
    return new Response(
      JSON.stringify({ message: `User already exists with this ${field}` }),
      {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      },
    );
  }

  return new Response(
    JSON.stringify({ message: `No user use this ${field}!` }),
    {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    },
  );
};
