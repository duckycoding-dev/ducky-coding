import type { APIRoute } from 'astro';
import { db, TopicsTable } from 'astro:db';

export const GET: APIRoute = async ({ request }) => {
  try {
    const topics = await db.select().from(TopicsTable);
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
