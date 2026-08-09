import { inArray, sql } from 'drizzle-orm';

import { getDb } from '../../client';
import type { Db } from '../../create-db';
import { type Image, imagesTable, type InsertImage } from './images.model';

const getImages = async (
  imagePaths: string[],
  db: Db = getDb(),
): Promise<Image[]> => {
  const images = await db
    .select()
    .from(imagesTable)
    .where(inArray(imagesTable.path, imagePaths));

  return images;
};

const getImagesByPaths = async (
  paths: string[],
  db: Db = getDb(),
): Promise<Image[]> => {
  const images = await db
    .select()
    .from(imagesTable)
    .where(inArray(imagesTable.path, paths));

  return images;
};

const getAllImages = async (db: Db = getDb()): Promise<Image[]> => {
  const images = await db.select().from(imagesTable).all();

  return images;
};

const upsertImage = async (
  images: InsertImage[],
  db: Db = getDb(),
): Promise<InsertImage[]> => {
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
