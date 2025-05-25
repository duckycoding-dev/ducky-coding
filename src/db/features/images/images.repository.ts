import { inArray, sql } from 'drizzle-orm';
import { db } from '../../client';
import { imagesTable, type Image, type InsertImage } from './images.model';

const getImages = async (imageIds: number[]): Promise<Image[]> => {
  const images = await db
    .select()
    .from(imagesTable)
    .where(inArray(imagesTable.id, imageIds));

  return images;
};

const getImagesByPaths = async (paths: string[]): Promise<Image[]> => {
  const images = await db
    .select()
    .from(imagesTable)
    .where(inArray(imagesTable.path, paths));

  return images;
};

const getAllImages = async (): Promise<Image[]> => {
  const images = await db.select().from(imagesTable).all();

  return images;
};

const upsertImage = async (images: InsertImage[]): Promise<InsertImage[]> => {
  const upsertedImages = await db
    .insert(imagesTable)
    .values(images)
    .onConflictDoUpdate({
      target: imagesTable.path,
      set: { alt: sql.raw(`excluded.${imagesTable.alt}`) },
    })
    .returning();
  return upsertedImages;
};

export const ImagesRepository = {
  getImages,
  getImagesByPaths,
  getAllImages,
  upsertImage,
};
