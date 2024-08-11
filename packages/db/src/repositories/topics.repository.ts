import { eq, inArray } from 'drizzle-orm';
import { db } from '../client';
import { ImagesTable, TopicsTable } from '../models';

const getTopics = async (topicTitles: string[]) => {
  const topics = await db
    .select()
    .from(TopicsTable)
    .where(inArray(TopicsTable.title, topicTitles));
  return topics;
};

const getAllTopics = async () => {
  const topics = await db.select().from(TopicsTable).all();
  return topics;
};

const getAllTopicsWithImage = async () => {
  const topics = await db
    .select()
    .from(TopicsTable)
    .leftJoin(ImagesTable, eq(TopicsTable.imageId, ImagesTable.id))
    .all();
  return topics;
};

export const TopicsRepository = {
  getTopics,
  getAllTopics,
  getAllTopicsWithImage,
};
