import { and, eq, inArray, like, or, sql } from 'drizzle-orm';

import { db } from '../../client';
import { memesTable } from '../memes/memes.model';
import { postsTable } from '../posts/posts.model';
import { postsTagsTable } from '../posts/posts_tags.model';
import type {
  MemeSearchResult,
  PostSearchResult,
  SearchParams,
} from './search.types';

// ---------------------------------------------------------------------------
// Posts
// ---------------------------------------------------------------------------

const searchPosts = async (
  params: SearchParams,
): Promise<{ results: PostSearchResult[]; total: number }> => {
  const { page, pageSize } = params;
  const offset = (page - 1) * pageSize;

  const tagSubquery =
    params.tags && params.tags.length > 0
      ? db
          .selectDistinct({ postId: postsTagsTable.postId })
          .from(postsTagsTable)
          .where(inArray(postsTagsTable.tagName, params.tags))
      : undefined;

  const whereClause = and(
    eq(postsTable.status, 'published'),
    params.q
      ? or(
          like(postsTable.title, `%${params.q}%`),
          like(postsTable.summary, `%${params.q}%`),
          like(postsTable.content, `%${params.q}%`),
        )
      : undefined,
    params.topic ? eq(postsTable.topicTitle, params.topic) : undefined,
    tagSubquery ? inArray(postsTable.id, tagSubquery) : undefined,
  );

  const [countRow, rows] = await Promise.all([
    db
      .select({ count: sql<number>`COUNT(*)` })
      .from(postsTable)
      .where(whereClause)
      .get(),
    db
      .select({
        id: postsTable.id,
        slug: postsTable.slug,
        title: postsTable.title,
        summary: postsTable.summary,
        author: postsTable.author,
        topicTitle: postsTable.topicTitle,
        bannerImagePath: postsTable.bannerImagePath,
        publishedAt: postsTable.publishedAt,
        timeToRead: postsTable.timeToRead,
        tagNames: sql<
          string | null
        >`GROUP_CONCAT(DISTINCT ${postsTagsTable.tagName})`,
      })
      .from(postsTable)
      .leftJoin(postsTagsTable, eq(postsTable.id, postsTagsTable.postId))
      .where(whereClause)
      .groupBy(postsTable.id)
      .orderBy(sql`${postsTable.publishedAt} DESC`)
      .limit(pageSize)
      .offset(offset)
      .all(),
  ]);

  const results: PostSearchResult[] = rows.map((row) => ({
    id: row.id,
    slug: row.slug,
    title: row.title,
    summary: row.summary,
    author: row.author,
    topicTitle: row.topicTitle,
    bannerImagePath: row.bannerImagePath,
    publishedAt: row.publishedAt,
    timeToRead: row.timeToRead,
    tags: row.tagNames ? row.tagNames.split(',') : [],
  }));

  return { results, total: countRow?.count ?? 0 };
};

// ---------------------------------------------------------------------------
// Memes
// ---------------------------------------------------------------------------

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
    params.q ? like(memesTable.title, `%${params.q}%`) : undefined,
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

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

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

export const searchRepository = {
  searchPosts,
  searchMemes,
};
