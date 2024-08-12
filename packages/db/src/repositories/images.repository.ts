import { inArray, sql } from 'drizzle-orm';
import { CreateImageDTO, ImageDTO } from '@ducky-coding/types/DTOs';
import { db } from '../client';
import { ImagesTable, mapToImageDTO } from '../models';

const getImages = async (imageIds: number[]): Promise<ImageDTO[]> => {
  const images = await db
    .select()
    .from(ImagesTable)
    .where(inArray(ImagesTable.id, imageIds));

  const imageDTOs: ImageDTO[] = images.map((image) => {
    return mapToImageDTO(image);
  });

  return imageDTOs;
};

const getImagesByPaths = async (paths: string[]): Promise<ImageDTO[]> => {
  const images = await db
    .select()
    .from(ImagesTable)
    .where(inArray(ImagesTable.path, paths));

  const imageDTOs: ImageDTO[] = images.map((image) => {
    return mapToImageDTO(image);
  });

  return imageDTOs;
};

const getAllImages = async (): Promise<ImageDTO[]> => {
  const images = await db.select().from(ImagesTable).all();
  const imageDTOs: ImageDTO[] = images.map((image) => {
    return mapToImageDTO(image);
  });

  return imageDTOs;
};

const upsertImage = async (images: CreateImageDTO[]): Promise<ImageDTO[]> => {
  const upsertedImages = await db
    .insert(ImagesTable)
    .values(images)
    .onConflictDoUpdate({
      target: ImagesTable.path,
      set: { alt: sql.raw(`excluded.${ImagesTable.alt}`) },
    })
    .returning();
  return upsertedImages.map((upsertedImage) => mapToImageDTO(upsertedImage));
};

export const ImagesRepository = {
  getImages,
  getImagesByPaths,
  getAllImages,
  upsertImage,
};
