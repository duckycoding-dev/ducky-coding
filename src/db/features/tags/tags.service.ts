import type { TagDTO } from '@custom-types/DTOs';
import { TagsRepository } from './tags.repository';

const getTag = async (tagTitle: string): Promise<TagDTO | undefined> => {
  const selectedTags = await TagsRepository.getTags([tagTitle]);
  return selectedTags[0];
};

const getTags = async (tagTitles: string[]): Promise<TagDTO[]> => {
  const selectedTags = await TagsRepository.getTags(tagTitles);
  return selectedTags;
};

const getAllTags = async (): Promise<TagDTO[]> => {
  const selectedTags = await TagsRepository.getAllTags();
  return selectedTags;
};

export const TagsService = {
  getTag,
  getTags,
  getAllTags,
};

// Add more methods as needed
