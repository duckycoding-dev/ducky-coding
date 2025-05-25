import type { Image } from '../images/images.model';
import type { Topic } from './topics.model';
import { TopicsRepository } from './topics.repository';

const getTopic = async (topicTitle: string): Promise<Topic | undefined> => {
  const selectedTopics = await TopicsRepository.getTopics([topicTitle]);
  return selectedTopics[0];
};

const getTopics = async (topicTitles: string[]): Promise<Topic[]> => {
  const selectedTopics = await TopicsRepository.getTopics(topicTitles);
  return selectedTopics;
};

const getAllTopics = async (): Promise<Topic[]> => {
  const selectedTopics = await TopicsRepository.getAllTopics();
  return selectedTopics;
};

const getAllTopicsWithImage = async (): Promise<
  (Topic & { image: Image | null })[]
> => {
  const selectedTopicWithImages =
    await TopicsRepository.getAllTopicsWithImage();

  return selectedTopicWithImages;
};

export const TopicsService = {
  getTopic,
  getTopics,
  getAllTopics,
  getAllTopicsWithImage,
};
