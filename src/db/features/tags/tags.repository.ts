import { inArray } from 'drizzle-orm';
import { db } from '../../client';
import { tagsTable, type Tag } from './tags.model';

const getTags = async (tagNames: string[]): Promise<Tag[]> => {
  const tags = await db
    .select()
    .from(tagsTable)
    .where(inArray(tagsTable.name, tagNames));

  return tags;
};

const getAllTags = async (): Promise<Tag[]> => {
  const tags = await db.select().from(tagsTable).all();
  return tags;
};

export const TagsRepository = {
  getTags,
  getAllTags,
};
