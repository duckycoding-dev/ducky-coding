import { eq, inArray } from 'drizzle-orm';

import { getDb } from '../../client';
import type { Db } from '../../create-db';
import { type Image, imagesTable } from '../images/images.model';
import { type Topic, topicsTable } from './topics.model';

const getTopics = async (
  topicTitles: string[],
  db: Db = getDb(),
): Promise<Topic[]> => {
  const topics = await db
    .select()
    .from(topicsTable)
    .where(inArray(topicsTable.title, topicTitles));

  return topics;
};

const getAllTopics = async (db: Db = getDb()): Promise<Topic[]> => {
  const topics = await db.select().from(topicsTable).all();

  return topics;
};

const getAllTopicsWithImage = async (
  db: Db = getDb(),
): Promise<(Topic & { image: Image | null })[]> => {
  const topicsWithImages = await db
    .select({
      topic: topicsTable,
      image: imagesTable,
    })
    .from(topicsTable)
    .leftJoin(imagesTable, eq(topicsTable.imagePath, imagesTable.path))
    .all();

  return topicsWithImages.map((row) => ({
    ...row.topic,
    image: row.image,
  }));
};

export const TopicsRepository = {
  getTopics,
  getAllTopics,
  getAllTopicsWithImage,
};
