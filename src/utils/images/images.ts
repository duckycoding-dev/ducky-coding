import type { ClientLogger, ServerLogger } from '@utils/logs/logger';
import type { ImageMetadata } from 'astro';

/**
 *
 * @param images a record of images to match
 * @param relativePath a relative path to match, starting from the src/assets/images directory: if none is provided, undefined is returned
 */
export async function matchImageFromGlobImport(
  images: Record<string, () => Promise<{ default: ImageMetadata }>>,
  relativePath?: string | undefined | null,
  logger?: ServerLogger | ClientLogger,
): Promise<ImageMetadata | undefined> {
  if (!relativePath === undefined || relativePath === null) {
    logger?.warn('A relative path is required to match an image');
    return undefined;
  }

  const fullPath = `/src/assets/images/${relativePath}`;
  try {
    return (await images[fullPath]?.())?.default;
  } catch (err) {
    logger?.error(`Can't find any image with path ${fullPath}`);
    logger?.debug(err);
  }

  return undefined;
}
