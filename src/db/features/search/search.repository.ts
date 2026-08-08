import { and, eq, inArray, or, sql } from 'drizzle-orm';

import { db } from '../../client';
import { MemesRepository } from '../memes/memes.repository';
import { postsTable } from '../posts/posts.model';
import { postsTagsTable } from '../posts/posts_tags.model';
import { likeContains } from './search.sql';
import type { PostSearchResult, SearchParams } from './search.types';

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
          likeContains(postsTable.title, params.q),
          likeContains(postsTable.summary, params.q),
          likeContains(postsTable.content, params.q),
        )
      : undefined,
    params.topics && params.topics.length > 0
      ? inArray(postsTable.topicTitle, params.topics)
      : undefined,
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

export const SearchRepository = {
  searchPosts,
  // Memes own their queries; search composes them rather than reaching into
  // the memes table itself.
  searchMemes: MemesRepository.searchMemes,
};
