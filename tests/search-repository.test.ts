import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { createDb, type Db } from '../src/db/create-db.ts';
import type { ContentStatus } from '../src/db/features/posts/posts.model.ts';
import { postsTable } from '../src/db/features/posts/posts.model.ts';
import { postsTagsTable } from '../src/db/features/posts/posts_tags.model.ts';
import { SearchRepository } from '../src/db/features/search/search.repository.ts';
import type { SearchParams } from '../src/db/features/search/search.types.ts';
import { tagsTable } from '../src/db/features/tags/tags.model.ts';
import { topicsTable } from '../src/db/features/topics/topics.model.ts';
import { buildMigrate } from '../src/db/sync/buildSync.ts';

// These run against a real throwaway SQLite file, migrated from the real
// migration files — the point is to verify SQL semantics (GROUP_CONCAT, the
// leftJoin, the count query, LIKE escaping), which no amount of mocking would
// prove.

let tempDir: string;
let db: Db;

beforeEach(async () => {
  // buildMigrate logs on every run; keep the suite output readable.
  vi.spyOn(console, 'log').mockImplementation(() => undefined);
  vi.spyOn(console, 'warn').mockImplementation(() => undefined);

  tempDir = await mkdtemp(path.join(tmpdir(), 'search-repo-'));
  const url = `file:${path.join(tempDir, 'test.db')}`;

  const migrated = await buildMigrate({ url });
  expect(migrated.success).toBe(true);

  db = createDb({ url });
});

afterEach(async () => {
  vi.restoreAllMocks();
  await rm(tempDir, { recursive: true, force: true });
});

// ---------------------------------------------------------------------------
// Fixture helpers
// ---------------------------------------------------------------------------

const seedTag = async (name: string): Promise<void> => {
  await db.insert(tagsTable).values({ name }).onConflictDoNothing();
};

const seedTopic = async (title: string): Promise<void> => {
  // topics.title is a FK onto tags.name, so the tag has to exist first.
  await seedTag(title);
  await db
    .insert(topicsTable)
    .values({ title, slug: title.toLowerCase() })
    .onConflictDoNothing();
};

interface PostSeed {
  slug: string;
  title?: string;
  summary?: string;
  content?: string;
  topicTitle?: string;
  tags?: string[];
  status?: ContentStatus;
  publishedAt?: number;
}

const seedPost = async (seed: PostSeed): Promise<number> => {
  const {
    slug,
    title = slug,
    summary = 'A fixture summary',
    content = 'A fixture content blurb',
    topicTitle = 'Astro',
    tags = [],
    status = 'published',
    publishedAt = 1_000,
  } = seed;

  await seedTopic(topicTitle);

  const inserted = await db
    .insert(postsTable)
    .values({ slug, title, summary, content, topicTitle, status, publishedAt })
    .returning({ id: postsTable.id });

  const row = inserted[0];
  if (row === undefined) {
    throw new Error(`Failed to seed post ${slug}`);
  }

  for (const tag of tags) {
    await seedTag(tag);
    await db.insert(postsTagsTable).values({ postId: row.id, tagName: tag });
  }

  return row.id;
};

const params = (overrides: Partial<SearchParams> = {}): SearchParams => ({
  type: 'all',
  page: 1,
  pageSize: 20,
  ...overrides,
});

// ---------------------------------------------------------------------------
// Tags: the leftJoin + GROUP_CONCAT path
// ---------------------------------------------------------------------------

describe('searchPosts — tag aggregation', () => {
  it('returns one row per post with all its tags, not one row per tag', async () => {
    await seedPost({ slug: 'multi', tags: ['Astro', 'CSS', 'TypeScript'] });

    const { results } = await SearchRepository.searchPosts(params(), db);

    expect(results).toHaveLength(1);
    expect(results[0]?.tags.sort()).toEqual(['Astro', 'CSS', 'TypeScript']);
  });

  it('includes a post with no tags at all, with an empty tags array', async () => {
    await seedPost({ slug: 'untagged', tags: [] });

    const { results } = await SearchRepository.searchPosts(params(), db);

    expect(results).toHaveLength(1);
    expect(results[0]?.slug).toBe('untagged');
    expect(results[0]?.tags).toEqual([]);
  });

  it('does not duplicate a tag shared with the topic name', async () => {
    // topicTitle 'Astro' is itself a tag row, so a post tagged 'Astro' has one
    // link — DISTINCT must not collapse across unrelated posts either.
    await seedPost({ slug: 'a', topicTitle: 'Astro', tags: ['Astro'] });
    await seedPost({ slug: 'b', topicTitle: 'Astro', tags: ['Astro'] });

    const { results } = await SearchRepository.searchPosts(params(), db);

    expect(results).toHaveLength(2);
    expect(results.map((r) => r.tags)).toEqual([['Astro'], ['Astro']]);
  });
});

// ---------------------------------------------------------------------------
// Filters
// ---------------------------------------------------------------------------

describe('searchPosts — filters', () => {
  it('matches any of the requested tags and returns each post once', async () => {
    await seedPost({ slug: 'both', tags: ['CSS', 'TypeScript'] });
    await seedPost({ slug: 'one', tags: ['CSS'] });
    await seedPost({ slug: 'neither', tags: ['React'] });

    const { results, total } = await SearchRepository.searchPosts(
      params({ tags: ['CSS', 'TypeScript'] }),
      db,
    );

    expect(results.map((r) => r.slug).sort()).toEqual(['both', 'one']);
    expect(total).toBe(2);
  });

  it('filters by topic', async () => {
    await seedPost({ slug: 'astro-post', topicTitle: 'Astro' });
    await seedPost({ slug: 'css-post', topicTitle: 'CSS' });

    const { results } = await SearchRepository.searchPosts(
      params({ topics: ['CSS'] }),
      db,
    );

    expect(results.map((r) => r.slug)).toEqual(['css-post']);
  });

  it('matches q against title, summary and content', async () => {
    await seedPost({ slug: 'by-title', title: 'Needle in the title' });
    await seedPost({ slug: 'by-summary', summary: 'Needle in the summary' });
    await seedPost({ slug: 'by-content', content: 'Needle in the content' });
    await seedPost({ slug: 'no-match', title: 'Nothing here' });

    const { results } = await SearchRepository.searchPosts(
      params({ q: 'Needle' }),
      db,
    );

    expect(results.map((r) => r.slug).sort()).toEqual([
      'by-content',
      'by-summary',
      'by-title',
    ]);
  });

  it('treats a % in q as a literal, not a wildcard', async () => {
    await seedPost({ slug: 'literal', title: '100% test coverage' });
    await seedPost({ slug: 'plain', title: 'No percent sign here' });

    const { results } = await SearchRepository.searchPosts(
      params({ q: '%' }),
      db,
    );

    expect(results.map((r) => r.slug)).toEqual(['literal']);
  });

  it('combines q, topic and tag filters', async () => {
    await seedPost({
      slug: 'wanted',
      title: 'Needle',
      topicTitle: 'CSS',
      tags: ['Grid'],
    });
    await seedPost({ slug: 'wrong-topic', title: 'Needle', tags: ['Grid'] });
    await seedPost({ slug: 'wrong-tag', title: 'Needle', topicTitle: 'CSS' });

    const { results } = await SearchRepository.searchPosts(
      params({ q: 'Needle', topics: ['CSS'], tags: ['Grid'] }),
      db,
    );

    expect(results.map((r) => r.slug)).toEqual(['wanted']);
  });
});

// ---------------------------------------------------------------------------
// Status scoping — an unpublished post must never surface
// ---------------------------------------------------------------------------

describe('searchPosts — status', () => {
  it('returns only published posts', async () => {
    await seedPost({ slug: 'published', status: 'published' });
    await seedPost({ slug: 'draft', status: 'draft' });
    await seedPost({ slug: 'deleted', status: 'deleted' });

    const { results, total } = await SearchRepository.searchPosts(params(), db);

    expect(results.map((r) => r.slug)).toEqual(['published']);
    expect(total).toBe(1);
  });
});

// ---------------------------------------------------------------------------
// Count and pagination
// ---------------------------------------------------------------------------

describe('searchPosts — total and pagination', () => {
  it('counts posts, not joined tag rows', async () => {
    // The count query has no join; if it ever grows one this returns 4.
    await seedPost({ slug: 'three-tags', tags: ['Astro', 'CSS', 'React'] });
    await seedPost({ slug: 'no-tags', tags: [] });

    const { total } = await SearchRepository.searchPosts(params(), db);

    expect(total).toBe(2);
  });

  it('offsets by page and keeps total constant across pages', async () => {
    for (let i = 0; i < 5; i++) {
      await seedPost({ slug: `post-${i}`, publishedAt: 1_000 + i });
    }

    const first = await SearchRepository.searchPosts(
      params({ page: 1, pageSize: 2 }),
      db,
    );
    const second = await SearchRepository.searchPosts(
      params({ page: 2, pageSize: 2 }),
      db,
    );
    const third = await SearchRepository.searchPosts(
      params({ page: 3, pageSize: 2 }),
      db,
    );

    expect(first.results.map((r) => r.slug)).toEqual(['post-4', 'post-3']);
    expect(second.results.map((r) => r.slug)).toEqual(['post-2', 'post-1']);
    expect(third.results.map((r) => r.slug)).toEqual(['post-0']);

    expect(first.total).toBe(5);
    expect(second.total).toBe(5);
    expect(third.total).toBe(5);
  });

  it('returns an empty page past the end without changing total', async () => {
    await seedPost({ slug: 'only' });

    const { results, total } = await SearchRepository.searchPosts(
      params({ page: 5, pageSize: 20 }),
      db,
    );

    expect(results).toEqual([]);
    expect(total).toBe(1);
  });

  it('orders by publishedAt descending', async () => {
    await seedPost({ slug: 'oldest', publishedAt: 1 });
    await seedPost({ slug: 'newest', publishedAt: 3 });
    await seedPost({ slug: 'middle', publishedAt: 2 });

    const { results } = await SearchRepository.searchPosts(params(), db);

    expect(results.map((r) => r.slug)).toEqual(['newest', 'middle', 'oldest']);
  });
});
