import { createClient } from '@libsql/client';
import { eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/libsql';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { imagesTable } from '../src/db/features/images/images.model.ts';
import { memesTable } from '../src/db/features/memes/memes.model.ts';
import { postsTable } from '../src/db/features/posts/posts.model.ts';
import { postsTagsTable } from '../src/db/features/posts/posts_tags.model.ts';
import { tagsTable } from '../src/db/features/tags/tags.model.ts';
import { topicsTable } from '../src/db/features/topics/topics.model.ts';
import { buildMigrate, buildSyncAllContent } from '../src/db/sync/buildSync.ts';

// ---------------------------------------------------------------------------
// Fixture helpers
// ---------------------------------------------------------------------------

const BANNER_PATH = 'posts/fixture-banner.png';
const MEME_IMAGE_PATH = 'memes/fixture-meme.png';

interface PostFixture {
  title?: string;
  /** Emit frontmatter with no `title` key, so PostContentSchema rejects it. */
  omitTitle?: boolean;
  summary?: string;
  content?: string;
  topicTitle?: string;
  tags?: string[];
  status?: 'draft' | 'published' | 'deleted';
  createdAt?: string;
  updatedAt?: string;
  body?: string;
}

function postFile(fixture: PostFixture = {}): string {
  const {
    title = 'A fixture post',
    omitTitle = false,
    summary = 'A fixture summary',
    content = 'A fixture content blurb',
    topicTitle = 'Astro',
    tags = ['Astro'],
    status = 'published',
    createdAt = '2025-06-04',
    updatedAt = '2025-06-08',
    body = 'Fixture body text.',
  } = fixture;

  const lines = [
    '---',
    ...(omitTitle ? [] : [`title: '${title}'`]),
    `summary: '${summary}'`,
    `content: '${content}'`,
    `topicTitle: '${topicTitle}'`,
    'tags:',
    ...tags.map((tag) => `  - '${tag}'`),
    `status: '${status}'`,
    `createdAt: ${createdAt}`,
    `updatedAt: ${updatedAt}`,
    '---',
    '',
    body,
  ];

  return `${lines.join('\n')}\n`;
}

function topicFile(title: string, slug: string): string {
  return `${JSON.stringify(
    {
      title,
      slug,
      description: `Everything about ${title}`,
    },
    null,
    2,
  )}\n`;
}

interface MemeFixture {
  title?: string;
  createdAt?: number | string;
  /** Emit frontmatter with no `createdAt` key, exercising the schema default. */
  omitCreatedAt?: boolean;
  tags?: string[];
}

function memeFile(fixture: MemeFixture = {}): string {
  const {
    title = 'A fixture meme',
    createdAt = 1749397806000,
    omitCreatedAt = false,
    tags = ['Blog'],
  } = fixture;

  const lines = [
    '---',
    `title: '${title}'`,
    "author: 'DuckyCoding'",
    `imagePath: '${MEME_IMAGE_PATH}'`,
    "imageAlt: 'A fixture meme alt text'",
    ...(omitCreatedAt ? [] : [`createdAt: ${createdAt}`]),
    'tags:',
    ...tags.map((tag) => `  - '${tag}'`),
    '---',
    '',
    'Fixture meme body.',
  ];

  return `${lines.join('\n')}\n`;
}

// ---------------------------------------------------------------------------
// Harness
// ---------------------------------------------------------------------------

interface Harness {
  projectRoot: string;
  dbUrl: string;
  db: ReturnType<typeof drizzle>;
  writePost: (slug: string, fixture?: PostFixture) => Promise<void>;
  writeTopic: (slug: string, title: string) => Promise<void>;
  writeMeme: (slug: string, fixture?: MemeFixture) => Promise<void>;
  removePost: (slug: string) => Promise<void>;
  sync: () => Promise<{ success: boolean; error?: string }>;
}

let harness: Harness;
let originalCwd: string;

beforeEach(async () => {
  // buildSync logs heavily; assertions are on DB state, not output.
  vi.spyOn(console, 'log').mockImplementation(() => undefined);
  vi.spyOn(console, 'warn').mockImplementation(() => undefined);

  originalCwd = process.cwd();
  const projectRoot = await mkdtemp(path.join(tmpdir(), 'build-sync-'));

  await mkdir(path.join(projectRoot, 'src/content/posts'), { recursive: true });
  await mkdir(path.join(projectRoot, 'src/content/topics'), {
    recursive: true,
  });
  await mkdir(path.join(projectRoot, 'src/content/memes'), { recursive: true });

  const dbUrl = `file:${path.join(projectRoot, 'test.db')}`;

  // Migrations resolve from the real src/db/migrations folder (buildMigrate
  // uses its own module dir), so cwd does not matter here.
  const migrated = await buildMigrate({ url: dbUrl });
  expect(migrated.success).toBe(true);

  const client = createClient({ url: dbUrl });
  const db = drizzle({ client, casing: 'snake_case' });

  // Seed the images rows the fixtures reference (FK targets); the image sync
  // is a separate function and is not under test here.
  await db
    .insert(imagesTable)
    .values([{ path: BANNER_PATH }, { path: MEME_IMAGE_PATH }])
    .onConflictDoNothing();

  process.chdir(projectRoot);

  harness = {
    projectRoot,
    dbUrl,
    db,
    writePost: (slug, fixture) =>
      writeFile(
        path.join(projectRoot, 'src/content/posts', `${slug}.mdx`),
        postFile(fixture),
        'utf-8',
      ),
    writeTopic: (slug, title) =>
      writeFile(
        path.join(projectRoot, 'src/content/topics', `${slug}.json`),
        topicFile(title, slug),
        'utf-8',
      ),
    writeMeme: (slug, fixture) =>
      writeFile(
        path.join(projectRoot, 'src/content/memes', `${slug}.mdx`),
        memeFile(fixture),
        'utf-8',
      ),
    removePost: (slug) =>
      rm(path.join(projectRoot, 'src/content/posts', `${slug}.mdx`)),
    sync: () => buildSyncAllContent({ url: dbUrl }),
  };
});

afterEach(async () => {
  process.chdir(originalCwd);
  await rm(harness.projectRoot, { recursive: true, force: true });
  vi.restoreAllMocks();
});

const tagNamesFor = async (postId: number): Promise<string[]> => {
  const rows = await harness.db
    .select()
    .from(postsTagsTable)
    .where(eq(postsTagsTable.postId, postId));

  return rows.map((row) => row.tagName).sort();
};

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('buildSyncAllContent — fresh sync', () => {
  it('inserts topics, posts, tag links and topic analytics', async () => {
    await harness.writeTopic('astro', 'Astro');
    await harness.writePost('first', { tags: ['Astro', 'SQLite'] });
    await harness.writePost('second', { tags: ['Astro'] });

    const result = await harness.sync();
    expect(result.success).toBe(true);

    const posts = await harness.db.select().from(postsTable);
    expect(posts.map((p) => p.slug).sort()).toEqual(['first', 'second']);

    const topics = await harness.db.select().from(topicsTable);
    expect(topics).toHaveLength(1);
    expect(topics[0]?.title).toBe('Astro');
    expect(topics[0]?.postCount).toBe(2);

    const first = posts.find((p) => p.slug === 'first');
    expect(first).toBeDefined();
    if (first) {
      expect(await tagNamesFor(first.id)).toEqual(['Astro', 'SQLite']);
    }

    const tags = await harness.db.select().from(tagsTable);
    expect(tags.map((t) => t.name).sort()).toEqual(['Astro', 'SQLite']);
  });

  it('stamps publishedAt for a published post and leaves deletedAt unset', async () => {
    await harness.writeTopic('astro', 'Astro');
    await harness.writePost('first');

    await harness.sync();

    const [post] = await harness.db.select().from(postsTable);
    expect(post?.publishedAt).toBeTypeOf('number');
    expect(post?.deletedAt).toBeNull();
  });
});

describe('buildSyncAllContent — idempotency', () => {
  it('leaves an unchanged post untouched on a second run', async () => {
    await harness.writeTopic('astro', 'Astro');
    await harness.writePost('first');

    await harness.sync();
    const [afterFirst] = await harness.db.select().from(postsTable);
    expect(afterFirst).toBeDefined();

    await harness.sync();
    const [afterSecond] = await harness.db.select().from(postsTable);

    expect(afterSecond).toEqual(afterFirst);
  });

  it('does not duplicate rows across runs', async () => {
    await harness.writeTopic('astro', 'Astro');
    await harness.writePost('first');
    await harness.writeMeme('meme-one');

    await harness.sync();
    await harness.sync();

    expect(await harness.db.select().from(postsTable)).toHaveLength(1);
    expect(await harness.db.select().from(memesTable)).toHaveLength(1);
    expect(await harness.db.select().from(topicsTable)).toHaveLength(1);
  });
});

describe('buildSyncAllContent — tag reconciliation', () => {
  it('replaces the tag set and cleans up newly unreferenced tags', async () => {
    await harness.writeTopic('astro', 'Astro');
    await harness.writePost('first', { tags: ['Astro', 'Ephemeral'] });
    await harness.sync();

    const [before] = await harness.db.select().from(postsTable);
    expect(before).toBeDefined();
    if (before) {
      expect(await tagNamesFor(before.id)).toEqual(['Astro', 'Ephemeral']);
    }

    await harness.writePost('first', { tags: ['Astro'] });
    await harness.sync();

    const [after] = await harness.db.select().from(postsTable);
    expect(after).toBeDefined();
    if (after) {
      expect(await tagNamesFor(after.id)).toEqual(['Astro']);
    }

    const tagNames = (await harness.db.select().from(tagsTable)).map(
      (t) => t.name,
    );
    expect(tagNames).not.toContain('Ephemeral');
    // The topic title tag survives cleanup even without post references.
    expect(tagNames).toContain('Astro');
  });
});

describe('buildSyncAllContent — orphan cleanup', () => {
  it('deletes a post and its tag links once its file is gone', async () => {
    await harness.writeTopic('astro', 'Astro');
    await harness.writePost('first');
    await harness.writePost('second');
    await harness.sync();

    const posts = await harness.db.select().from(postsTable);
    const second = posts.find((p) => p.slug === 'second');
    expect(second).toBeDefined();

    await harness.removePost('second');
    await harness.sync();

    const remaining = await harness.db.select().from(postsTable);
    expect(remaining.map((p) => p.slug)).toEqual(['first']);

    if (second) {
      expect(await tagNamesFor(second.id)).toEqual([]);
    }
  });

  it('keeps a validation-failed post whose file is still on disk', async () => {
    await harness.writeTopic('astro', 'Astro');
    await harness.writePost('first');
    await harness.writePost('second');
    await harness.sync();

    expect(await harness.db.select().from(postsTable)).toHaveLength(2);

    // The file still exists, it just fails PostContentSchema (no title).
    await harness.writePost('second', { omitTitle: true });
    const result = await harness.sync();
    expect(result.success).toBe(true);

    // Cleanup keys off seenSlugs, so the row survives with its last good data.
    const remaining = await harness.db.select().from(postsTable);
    expect(remaining.map((p) => p.slug).sort()).toEqual(['first', 'second']);

    const stale = remaining.find((p) => p.slug === 'second');
    expect(stale?.title).toBe('A fixture post');
  });

  it('warns instead of deleting when a post fails validation', async () => {
    const warn = vi.spyOn(console, 'warn');

    await harness.writeTopic('astro', 'Astro');
    await harness.writePost('first');
    await harness.writePost('second');
    await harness.sync();

    warn.mockClear();
    await harness.writePost('second', { omitTitle: true });
    await harness.sync();

    const messages = warn.mock.calls.map((call) => String(call[0]));
    expect(messages.some((m) => m.includes('KEPT in the database'))).toBe(true);
  });

  it('keeps the row when every post fails validation', async () => {
    await harness.writeTopic('astro', 'Astro');
    await harness.writePost('only');
    await harness.sync();

    await harness.writePost('only', { omitTitle: true });
    await harness.sync();

    expect(await harness.db.select().from(postsTable)).toHaveLength(1);
  });

  it('skips topic cleanup when a topic file cannot be parsed', async () => {
    await harness.writeTopic('astro', 'Astro');
    await harness.writeTopic('css', 'CSS');
    await harness.writePost('first');
    await harness.sync();

    expect(await harness.db.select().from(topicsTable)).toHaveLength(2);

    // Corrupt one topic file: its title is unknowable, so cleanup must not run.
    await writeFile(
      path.join(harness.projectRoot, 'src/content/topics/css.json'),
      '{ not valid json',
      'utf-8',
    );
    await harness.sync();

    const topics = await harness.db.select().from(topicsTable);
    expect(topics.map((t) => t.title).sort()).toEqual(['Astro', 'CSS']);
  });

  it('still deletes a topic once its file is genuinely removed', async () => {
    await harness.writeTopic('astro', 'Astro');
    await harness.writeTopic('css', 'CSS');
    await harness.writePost('first');
    await harness.sync();

    await rm(path.join(harness.projectRoot, 'src/content/topics/css.json'));
    await harness.sync();

    const topics = await harness.db.select().from(topicsTable);
    expect(topics.map((t) => t.title)).toEqual(['Astro']);
  });

  it('keeps a meme whose frontmatter is broken but whose file exists', async () => {
    await harness.writeTopic('astro', 'Astro');
    await harness.writeMeme('meme-one');
    await harness.writeMeme('meme-two');
    await harness.sync();

    expect(await harness.db.select().from(memesTable)).toHaveLength(2);

    await writeFile(
      path.join(harness.projectRoot, 'src/content/memes/meme-two.mdx'),
      '---\ntitle: 42\n---\n',
      'utf-8',
    );
    await harness.sync();

    const memes = await harness.db.select().from(memesTable);
    expect(memes.map((m) => m.slug).sort()).toEqual(['meme-one', 'meme-two']);
  });
});

describe('buildSyncAllContent — soft-delete timestamps', () => {
  it('KNOWN BUG (plan 006): deletedAt reset on edit of deleted post', async () => {
    await harness.writeTopic('astro', 'Astro');
    await harness.writePost('first', { status: 'published' });
    await harness.sync();

    // Transition into deleted — this stamps deletedAt.
    await harness.writePost('first', { status: 'deleted' });
    await harness.sync();

    const [deleted] = await harness.db.select().from(postsTable);
    expect(deleted?.deletedAt).toBeTypeOf('number');

    // Any further edit while still deleted wipes the timestamp.
    await harness.writePost('first', {
      status: 'deleted',
      title: 'A retitled fixture post',
    });
    await harness.sync();

    const [edited] = await harness.db.select().from(postsTable);
    expect(edited?.status).toBe('deleted');
    // Plan 006 flips this: the original timestamp should be PRESERVED.
    expect(edited?.deletedAt).toBeNull();
  });
});

describe('buildSyncAllContent — memes', () => {
  it('inserts a meme with its tags serialized as JSON', async () => {
    await harness.writeTopic('astro', 'Astro');
    await harness.writeMeme('meme-one', { tags: ['Blog', 'Astro'] });

    await harness.sync();

    const [meme] = await harness.db.select().from(memesTable);
    expect(meme?.slug).toBe('meme-one');
    expect(meme?.imagePath).toBe(MEME_IMAGE_PATH);
    expect(JSON.parse(meme?.tags ?? '[]')).toEqual(['Blog', 'Astro']);
  });

  it('deletes a meme once its file is gone', async () => {
    await harness.writeTopic('astro', 'Astro');
    await harness.writeMeme('meme-one');
    await harness.writeMeme('meme-two');
    await harness.sync();

    expect(await harness.db.select().from(memesTable)).toHaveLength(2);

    await rm(path.join(harness.projectRoot, 'src/content/memes/meme-two.mdx'));
    await harness.sync();

    const remaining = await harness.db.select().from(memesTable);
    expect(remaining.map((m) => m.slug)).toEqual(['meme-one']);
  });

  it('KNOWN BUG (plan 006): meme without createdAt is rewritten every sync', async () => {
    await harness.writeTopic('astro', 'Astro');
    await harness.writeMeme('meme-one', { omitCreatedAt: true });

    await harness.sync();
    const [first] = await harness.db.select().from(memesTable);

    await harness.sync();
    const [second] = await harness.db.select().from(memesTable);

    // .default(Date.now) re-evaluates per parse, so the record never matches
    // what is in the DB and the row churns on every build. Plan 006 flips
    // this to expect equality.
    expect(second?.createdAt).not.toBe(first?.createdAt);
  });
});

describe('buildSyncAllContent — failure handling', () => {
  it('returns success: false when the database is unreachable', async () => {
    const result = await buildSyncAllContent({
      url: 'file:/nonexistent-directory/definitely-not-here.db',
    });

    expect(result.success).toBe(false);
    expect(result.error).toBeTypeOf('string');
  });
});
