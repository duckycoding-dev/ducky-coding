import { inArray } from 'drizzle-orm';
import { db } from '../client';
import { TagsTable } from '../models';

const getTags = async (tagNames: string[]) => {
  const tags = await db
    .select()
    .from(TagsTable)
    .where(inArray(TagsTable.name, tagNames));
  return tags;
};

const getAllTags = async () => {
  const tags = await db.select().from(TagsTable).all();
  return tags;
};

export const TagsRepository = {
  getTags,
  getAllTags,
};
