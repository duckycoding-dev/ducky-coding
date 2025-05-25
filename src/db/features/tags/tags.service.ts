import type { Tag } from './tags.model';
import { TagsRepository } from './tags.repository';

const getTag = async (tagTitle: string): Promise<Tag | undefined> => {
  const selectedTags = await TagsRepository.getTags([tagTitle]);
  return selectedTags[0];
};

const getTags = async (tagTitles: string[]): Promise<Tag[]> => {
  const selectedTags = await TagsRepository.getTags(tagTitles);
  return selectedTags;
};

const getAllTags = async (): Promise<Tag[]> => {
  const selectedTags = await TagsRepository.getAllTags();
  return selectedTags;
};

export const TagsService = {
  getTag,
  getTags,
  getAllTags,
};
