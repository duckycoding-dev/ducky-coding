import { and, sql } from 'drizzle-orm';

import { db } from '../../client';
import { likeContains } from '../search/search.sql';
import type { MemeSearchResult, SearchParams } from '../search/search.types';
import { memesTable } from './memes.model';

function parseTags(tagsJson: string): string[] {
  try {
    const parsed: unknown = JSON.parse(tagsJson);
    return Array.isArray(parsed)
      ? parsed.filter((t): t is string => typeof t === 'string')
      : [];
  } catch {
    return [];
  }
}

const searchMemes = async (
  params: SearchParams,
): Promise<{ results: MemeSearchResult[]; total: number }> => {
  const { page, pageSize } = params;
  const offset = (page - 1) * pageSize;

  const tagFilter =
    params.tags && params.tags.length > 0
      ? sql`EXISTS (
          SELECT 1 FROM json_each(${memesTable.tags}) je
          WHERE je.value IN (${sql.join(
            params.tags.map((t) => sql`${t}`),
            sql`, `,
          )})
        )`
      : undefined;

  const whereClause = and(
    params.q ? likeContains(memesTable.title, params.q) : undefined,
    tagFilter,
  );

  const [countRow, rows] = await Promise.all([
    db
      .select({ count: sql<number>`COUNT(*)` })
      .from(memesTable)
      .where(whereClause)
      .get(),
    db
      .select()
      .from(memesTable)
      .where(whereClause)
      .orderBy(sql`${memesTable.createdAt} DESC`)
      .limit(pageSize)
      .offset(offset)
      .all(),
  ]);

  const results: MemeSearchResult[] = rows.map((row) => ({
    id: row.id,
    slug: row.slug,
    title: row.title,
    author: row.author,
    imagePath: row.imagePath,
    imageAlt: row.imageAlt,
    createdAt: row.createdAt,
    tags: parseTags(row.tags),
  }));

  return { results, total: countRow?.count ?? 0 };
};

export const MemesRepository = {
  searchMemes,
};
