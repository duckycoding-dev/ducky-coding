import { TopicDTO, TopicWithImageDTO } from '@ducky-coding/types/DTOs';
import { TopicsRepository } from '../repositories/topics.repository';
import { mapToTopicWithImageDTO } from '../mappers/topics.mappers';
import { mapToTopicDTO } from '../models';

const getTopic = async (topicTitle: string): Promise<TopicDTO | undefined> => {
  const selectedTopics = await TopicsRepository.getTopics([topicTitle]);
  if (selectedTopics.length === 0) return undefined;

  const topicDTO: TopicDTO = mapToTopicDTO(selectedTopics[0]);
  return topicDTO;
};

const getTopics = async (topicTitles: string[]): Promise<TopicDTO[]> => {
  const selectedTopics = await TopicsRepository.getTopics(topicTitles);

  const topicDTOs: TopicDTO[] = selectedTopics.map((topic) => {
    return mapToTopicDTO(topic);
  });
  return topicDTOs;
};

const getAllTopics = async (): Promise<TopicDTO[]> => {
  const selectedTopics = await TopicsRepository.getAllTopics();

  const topicDTOs: TopicDTO[] = selectedTopics.map((topic) => {
    return mapToTopicDTO(topic);
  });
  return topicDTOs;
};

const getAllTopicsWithImage = async (): Promise<TopicWithImageDTO[]> => {
  const selectedTopicsWithImages =
    await TopicsRepository.getAllTopicsWithImage();

  const topicWithImageDTOs: TopicWithImageDTO[] = selectedTopicsWithImages.map(
    (topicWithImage) => {
      return mapToTopicWithImageDTO(
        topicWithImage.topics,
        topicWithImage.images ?? undefined,
      );
    },
  );
  return topicWithImageDTOs;
};

export const TopicsService = {
  getTopic,
  getTopics,
  getAllTopics,
  getAllTopicsWithImage,
};

// Add more methods as needed
