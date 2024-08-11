import { inArray } from 'drizzle-orm';
import { db } from '../client';
import { ImagesTable } from '../models';

const getImages = async (imageIds: number[]) => {
  const images = await db
    .select()
    .from(ImagesTable)
    .where(inArray(ImagesTable.id, imageIds));
  return images;
};

const getAllImages = async () => {
  const images = await db.select().from(ImagesTable).all();
  return images;
};

export const ImagesRepository = {
  getImages,
  getAllImages,
};
