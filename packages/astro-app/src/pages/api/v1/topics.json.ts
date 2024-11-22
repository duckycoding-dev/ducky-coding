import type { APIRoute } from 'astro';
import { TopicsService } from '@ducky-coding/db/services';
import { serverLogger } from '@utils/logs/logger';

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
