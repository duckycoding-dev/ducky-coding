import type { APIRoute } from 'astro';
import { TopicsTable } from '@db/tables/TopicsTable/TopicsTable';
import { db } from '@db/client';

export const GET: APIRoute = async ({ request }) => {
  try {
    console.log(db);
    const topics = await db.select().from(TopicsTable).all();
    return new Response(JSON.stringify(topics), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error fetching topics:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch topics' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
};
