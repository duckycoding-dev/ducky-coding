import { eq, inArray } from 'drizzle-orm';
import type { TopicDTO, TopicWithImageDTO } from '@ducky-coding/types/DTOs';
import { db } from '../client';
import { ImagesTable, mapToTopicDTO, TopicsTable } from '../models';
import { mapToTopicWithImageDTO } from '../mappers/topics.mappers';

const getTopics = async (topicTitles: string[]): Promise<TopicDTO[]> => {
  const topics = await db
    .select()
    .from(TopicsTable)
    .where(inArray(TopicsTable.title, topicTitles));

  const topicDTOs: TopicDTO[] = topics.map((topic) => {
    return mapToTopicDTO(topic);
  });

  return topicDTOs;
};

const getAllTopics = async (): Promise<TopicDTO[]> => {
  console.log('DAVIDELOG');
  const topics = await db.select().from(TopicsTable).all();
  const topicDTOs: TopicDTO[] = topics.map((topic) => {
    return mapToTopicDTO(topic);
  });

  return topicDTOs;
};

const getAllTopicsWithImage = async (): Promise<TopicWithImageDTO[]> => {
  const topics = await db
    .select()
    .from(TopicsTable)
    .leftJoin(ImagesTable, eq(TopicsTable.imageId, ImagesTable.id))
    .all();

  const topicWithImageDTOs: TopicWithImageDTO[] = topics.map(
    (topicWithImage) => {
      return mapToTopicWithImageDTO(
        topicWithImage.topics,
        topicWithImage.images ?? undefined,
      );
    },
  );
  return topicWithImageDTOs;
};

export const TopicsRepository = {
  getTopics,
  getAllTopics,
  getAllTopicsWithImage,
};
