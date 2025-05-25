import { eq, inArray } from 'drizzle-orm';
import { db } from '../../client';
import { imagesTable, type Image } from '../images/images.model';
import { topicsTable, type Topic } from './topics.model';

const getTopics = async (topicTitles: string[]): Promise<Topic[]> => {
  const topics = await db
    .select()
    .from(topicsTable)
    .where(inArray(topicsTable.title, topicTitles));

  return topics;
};

const getAllTopics = async (): Promise<Topic[]> => {
  const topics = await db.select().from(topicsTable).all();

  return topics;
};

const getAllTopicsWithImage = async (): Promise<
  (Topic & { image: Image | null })[]
> => {
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
