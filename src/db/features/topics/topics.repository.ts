import { eq, inArray } from 'drizzle-orm';
import type { TopicDTO, TopicWithImageDTO } from '@custom-types/DTOs';
import { db } from '../../client';
import { ImagesTable } from '../images/images.model';
import { mapToTopicWithImageDTO } from './topics.mappers';
import { TopicsTable, mapToTopicDTO } from './topics.model';

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
