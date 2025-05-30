import type { APIRoute } from 'astro';
import { TopicsService } from '@db/features/topics/topics.service';
import { serverLogger } from '@utils/logs/logger';
import { TURSO_AUTH_TOKEN } from 'astro:env/server';
import { syncTopicsToDatabase } from '../../../db/sync/contentSync';

export const prerender = false; // Disable prerendering for this API route

export const GET: APIRoute = async () => {
  try {
    const topics = await TopicsService.getAllTopics();
    return new Response(JSON.stringify(topics), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    serverLogger.error('Error fetching topics:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch topics' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
};

export const POST: APIRoute = async ({ request }) => {
  if (
    request.headers.get('Authorization') !== `Bearer ${TURSO_AUTH_TOKEN}` &&
    import.meta.env.MODE === 'production'
  ) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
  serverLogger.info('📋 Syncing topics from assets folder...');
  try {
    const result = await syncTopicsToDatabase();
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    if (error instanceof Error) {
      return new Response(
        JSON.stringify({ error: error.message || 'Failed to sync topics' }),
        {
          status: 500,
          statusText: 'Internal Server Error',
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );
    } else {
      return new Response(
        JSON.stringify({ error: 'An unknown error occurred' }),
        {
          status: 500,
          statusText: 'Internal Server Error',
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );
    }
  }
};
