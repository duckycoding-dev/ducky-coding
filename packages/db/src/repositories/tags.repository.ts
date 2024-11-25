import { inArray } from 'drizzle-orm';
import type { TagDTO } from '@ducky-coding/types/DTOs';
import { db } from '../client';
import { mapToTagDTO, TagsTable } from '../models';

const getTags = async (tagNames: string[]): Promise<TagDTO[]> => {
  const tags = await db
    .select()
    .from(TagsTable)
    .where(inArray(TagsTable.name, tagNames));
  const tagDTOs = tags.map((tag) => {
    return mapToTagDTO(tag);
  });
  return tagDTOs;
};

const getAllTags = async (): Promise<TagDTO[]> => {
  const tags = await db.select().from(TagsTable).all();
  const tagDTOs = tags.map((tag) => {
    return mapToTagDTO(tag);
  });
  return tagDTOs;
};

export const TagsRepository = {
  getTags,
  getAllTags,
};
