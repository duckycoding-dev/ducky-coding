import type { APIRoute } from 'astro';
import { serverLogger } from '@utils/logs/logger';
import { ImagesService } from '@db/features/images/images.service';
import { syncImages } from '@db/sync/contentSync';
import { TURSO_AUTH_TOKEN } from 'astro:env/server';

export const prerender = false; // Disable prerendering for this API route

export const GET: APIRoute = async ({ url }) => {
  const pathOfImageDataToFetch = url.searchParams.get('path');
  if (!pathOfImageDataToFetch) {
    serverLogger.warn('No path provided to fetch topics');
    return new Response(
      JSON.stringify({ error: 'Path parameter is required' }),
      {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );
  }

  try {
    const image = await ImagesService.getImageByPath(pathOfImageDataToFetch);
    if (!image) {
      serverLogger.warn(`No image found for path: ${pathOfImageDataToFetch}`);
      return new Response(JSON.stringify({ error: 'Image not found' }), {
        status: 404,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }
    return new Response(JSON.stringify(image), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    serverLogger.error('Error fetching images:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch images' }), {
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
  serverLogger.info('🎨 Syncing images from assets folder...');
  try {
    const result = await syncImages();
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    if (error instanceof Error) {
      return new Response(
        JSON.stringify({ error: error.message || 'Failed to sync images' }),
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
