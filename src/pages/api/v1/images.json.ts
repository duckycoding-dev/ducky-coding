import type { APIRoute } from 'astro';
import { serverLogger } from '@utils/logs/logger';
import { ImagesService } from '../../../db/features/images/images.service';

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
