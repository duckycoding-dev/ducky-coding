import type { TopicDTO, TopicWithImageDTO } from '@ducky-coding/types/DTOs';
import { TopicsRepository } from '../repositories/topics.repository';

const getTopic = async (topicTitle: string): Promise<TopicDTO | undefined> => {
  const selectedTopics = await TopicsRepository.getTopics([topicTitle]);
  return selectedTopics[0];
};

const getTopics = async (topicTitles: string[]): Promise<TopicDTO[]> => {
  const selectedTopics = await TopicsRepository.getTopics(topicTitles);
  return selectedTopics;
};

const getAllTopics = async (): Promise<TopicDTO[]> => {
  const selectedTopics = await TopicsRepository.getAllTopics();
  return selectedTopics;
};

const getAllTopicsWithImage = async (): Promise<TopicWithImageDTO[]> => {
  const selectedTopicWithImages: TopicWithImageDTO[] =
    await TopicsRepository.getAllTopicsWithImage();

  return selectedTopicWithImages;
};

export const TopicsService = {
  getTopic,
  getTopics,
  getAllTopics,
  getAllTopicsWithImage,
};

// Add more methods as needed
