import { inArray } from 'drizzle-orm';

import { getDb } from '../../client';
import type { Db } from '../../create-db';
import { type Tag, tagsTable } from './tags.model';

const getTags = async (
  tagNames: string[],
  db: Db = getDb(),
): Promise<Tag[]> => {
  const tags = await db
    .select()
    .from(tagsTable)
    .where(inArray(tagsTable.name, tagNames));

  return tags;
};

const getAllTags = async (db: Db = getDb()): Promise<Tag[]> => {
  const tags = await db.select().from(tagsTable).all();
  return tags;
};

export const TagsRepository = {
  getTags,
  getAllTags,
};
