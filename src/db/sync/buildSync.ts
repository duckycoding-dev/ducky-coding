/**
 * Node-safe sync module for use in Astro integration hooks.
 *
 * This module replicates the logic from contentSync.ts but uses:
 * - node:fs/promises glob instead of import.meta.glob (Vite-only)
 * - Direct filesystem reading instead of getCollection (Astro virtual module)
 * - process.env instead of import.meta.env (Vite-only)
 *
 * Compatible with Node 22+ (native glob in node:fs/promises).
 */

import { createClient } from '@libsql/client';
import { eq, sql } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/libsql';
import { glob } from 'node:fs/promises';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

import { imagesTable } from '../features/images/images.model.ts';
import { type InsertPost, postsTable } from '../features/posts/posts.model.ts';
import { postsTagsTable } from '../features/posts/posts_tags.model.ts';
import { tagsTable } from '../features/tags/tags.model.ts';
import { topicsTable } from '../features/topics/topics.model.ts';

// ---------------------------------------------------------------------------
// Standalone DB client (no import.meta.env / Vite path aliases)
// ---------------------------------------------------------------------------

function createDb() {
  const url = process.env['TURSO_DATABASE_URL'];
  const authToken = process.env['TURSO_AUTH_TOKEN'];

  if (!url) {
    throw new Error('TURSO_DATABASE_URL environment variable is not set');
  }

  const turso = createClient({ url, authToken });
  return drizzle({ client: turso, casing: 'snake_case' });
}

// ---------------------------------------------------------------------------
// Frontmatter parsing helpers
// ---------------------------------------------------------------------------

interface PostFrontmatter {
  title: string;
  summary: string;
  content: string;
  author: string;
  topicTitle: string;
  language?: string;
  timeToRead?: number;
  status: 'draft' | 'published' | 'deleted';
  tags?: string[];
  isFeatured?: boolean;
  bannerImagePath?: string;
  createdAt: Date;
  publishedAt?: Date;
  updatedAt?: Date;
}

interface TopicFrontmatter {
  title: string;
  slug: string;
  imagePath?: string;
  description: string;
  backgroundGradient?: string;
  externalLink?: string;
}

function extractFrontmatter(fileContent: string): {
  frontmatter: string;
  body: string;
} {
  const match = /^---\r?\n([\s\S]*?)\r?\n---/.exec(fileContent);
  if (!match) {
    return { frontmatter: '', body: fileContent };
  }
  const frontmatter = match[1] ?? '';
  const body = fileContent.slice(match[0].length);
  return { frontmatter, body };
}

function parseDate(value: unknown): Date | undefined {
  if (value instanceof Date) return value;
  if (typeof value === 'string' || typeof value === 'number') {
    const d = new Date(value);
    return isNaN(d.getTime()) ? undefined : d;
  }
  return undefined;
}

/**
 * Minimal regex-based YAML frontmatter parser.
 * Handles the scalar and list patterns used in this project's post frontmatter.
 * Does not support nested objects or multi-line block scalars.
 */
function parseSimpleYaml(raw: string): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  const lines = raw.split(/\r?\n/);
  let i = 0;

  while (i < lines.length) {
    const line = lines[i] ?? '';
    i++;

    // Skip blank lines and comments
    if (!line.trim() || line.trim().startsWith('#')) continue;

    // List item at top level (shouldn't appear, but guard anyway)
    if (/^\s+-/.test(line) && !/:/.test(line)) continue;

    // Key: value line
    const kvMatch = /^(\w+):\s*(.*)$/.exec(line);
    if (!kvMatch) continue;

    const key = kvMatch[1] ?? '';
    const rawValue = (kvMatch[2] ?? '').trim();

    // Check if next lines are a YAML list (items starting with "  - ")
    const listItems: string[] = [];
    while (i < lines.length) {
      const next = lines[i] ?? '';
      const listMatch = /^\s+-\s+(.+)$/.exec(next);
      if (listMatch) {
        listItems.push((listMatch[1] ?? '').replace(/^['"]|['"]$/g, '').trim());
        i++;
      } else {
        break;
      }
    }

    if (listItems.length > 0) {
      result[key] = listItems;
      continue;
    }

    // Empty value (list or block follows) — if no list captured, treat as null
    if (rawValue === '') {
      result[key] = null;
      continue;
    }

    // Strip surrounding quotes
    const unquoted = rawValue.replace(/^(['"])(.*)\1$/, '$2');

    // Boolean
    if (unquoted === 'true') {
      result[key] = true;
      continue;
    }
    if (unquoted === 'false') {
      result[key] = false;
      continue;
    }

    // Number
    if (/^-?\d+(\.\d+)?$/.test(unquoted)) {
      result[key] = Number(unquoted);
      continue;
    }

    // Date (YYYY-MM-DD)
    if (/^\d{4}-\d{2}-\d{2}$/.test(unquoted)) {
      result[key] = new Date(unquoted);
      continue;
    }

    result[key] = unquoted;
  }

  return result;
}

function parsePostFrontmatter(
  rawFrontmatter: string,
): PostFrontmatter | undefined {
  try {
    const parsed = parseSimpleYaml(rawFrontmatter);

    const createdAt = parseDate(parsed['createdAt']);
    if (!createdAt) {
      console.log('  Skipping post: missing or invalid createdAt');
      return undefined;
    }

    const status = parsed['status'];
    if (status !== 'draft' && status !== 'published' && status !== 'deleted') {
      console.log(`  Skipping post: invalid status "${String(status)}"`);
      return undefined;
    }

    const title = parsed['title'];
    const summary = parsed['summary'];
    const content = parsed['content'];
    const author = parsed['author'];
    const topicTitle = parsed['topicTitle'];

    if (
      typeof title !== 'string' ||
      typeof summary !== 'string' ||
      typeof content !== 'string' ||
      typeof author !== 'string' ||
      typeof topicTitle !== 'string'
    ) {
      console.log('  Skipping post: missing required string fields');
      return undefined;
    }

    return {
      title,
      summary,
      content,
      author,
      topicTitle,
      language:
        typeof parsed['language'] === 'string' ? parsed['language'] : 'en',
      timeToRead:
        typeof parsed['timeToRead'] === 'number' ? parsed['timeToRead'] : 1,
      status,
      tags: Array.isArray(parsed['tags'])
        ? (parsed['tags'] as string[]).filter((t) => typeof t === 'string')
        : [],
      isFeatured:
        typeof parsed['isFeatured'] === 'boolean'
          ? parsed['isFeatured']
          : false,
      bannerImagePath:
        typeof parsed['bannerImagePath'] === 'string'
          ? parsed['bannerImagePath']
          : undefined,
      createdAt,
      publishedAt: parseDate(parsed['publishedAt']),
      updatedAt: parseDate(parsed['updatedAt']),
    };
  } catch (err) {
    console.log('  Failed to parse frontmatter:', err);
    return undefined;
  }
}

// ---------------------------------------------------------------------------
// buildSyncImages
// ---------------------------------------------------------------------------

export async function buildSyncImages(): Promise<{
  imagesAdded: number;
  message?: string;
}> {
  console.log('Starting image sync to database (build)...');

  const db = createDb();
  const projectRoot = process.cwd();
  const imageGlobPattern = path.join(
    projectRoot,
    'src/assets/images/**/*.{png,jpg,jpeg,gif,svg}',
  );

  const absolutePaths: string[] = [];
  for await (const entry of glob(imageGlobPattern)) {
    absolutePaths.push(entry);
  }

  if (absolutePaths.length === 0) {
    console.log('No images found to sync.');
    return { imagesAdded: 0, message: 'No images found to sync.' };
  }

  const assetsImagesMarker = `assets/images/`;
  const relativePaths = absolutePaths
    .map((p) => {
      const idx = p.indexOf(assetsImagesMarker);
      return idx !== -1 ? p.slice(idx + assetsImagesMarker.length) : undefined;
    })
    .filter((p): p is string => p !== undefined);

  console.log(`Found ${relativePaths.length} images to sync.`);

  const result = await db
    .insert(imagesTable)
    .values(relativePaths.map((p) => ({ path: p })))
    .onConflictDoNothing();

  if (result.rowsAffected > 0) {
    console.log(`Synced ${result.rowsAffected} new images to database.`);
    console.log('CAREFUL: alt texts must be added manually to the db.');
  }

  return {
    imagesAdded: result.rowsAffected,
    message: 'Images synced successfully.',
  };
}

// ---------------------------------------------------------------------------
// buildSyncAllContent
// ---------------------------------------------------------------------------

export async function buildSyncAllContent(): Promise<{
  success: boolean;
  error?: string;
}> {
  console.log('Starting complete content sync (build)...');

  try {
    const db = createDb();
    const projectRoot = process.cwd();

    // 1. Sync topics --------------------------------------------------------
    console.log('Starting topics sync to database...');

    const topicGlobPattern = path.join(
      projectRoot,
      'src/content/topics/**/*.json',
    );
    let topicsSyncedCount = 0;
    let topicsSkippedCount = 0;

    for await (const topicFilePath of glob(topicGlobPattern)) {
      try {
        const fileContent = await readFile(topicFilePath, 'utf-8');
        const topicData = JSON.parse(fileContent) as TopicFrontmatter;

        if (!topicData.title || !topicData.slug) {
          console.log(
            `  Skipping topic file ${topicFilePath}: missing title or slug`,
          );
          topicsSkippedCount++;
          continue;
        }

        const existingTopic = await db
          .select()
          .from(topicsTable)
          .where(eq(topicsTable.title, topicData.title))
          .get();

        const topicRecord = {
          title: topicData.title,
          slug: topicData.slug,
          imagePath: topicData.imagePath ?? null,
          description: topicData.description,
          backgroundGradient: topicData.backgroundGradient ?? null,
          externalLink: topicData.externalLink ?? null,
          updatedAt: Date.now(),
        };

        if (existingTopic) {
          const changed =
            existingTopic.slug !== topicRecord.slug ||
            existingTopic.imagePath !== topicRecord.imagePath ||
            existingTopic.description !== topicRecord.description ||
            existingTopic.backgroundGradient !==
              topicRecord.backgroundGradient ||
            existingTopic.externalLink !== topicRecord.externalLink;

          if (changed) {
            await db
              .update(topicsTable)
              .set(topicRecord)
              .where(eq(topicsTable.title, existingTopic.title));

            console.log(`  Updated topic: ${topicData.title}`);
          }
        } else {
          // Ensure corresponding tag exists before inserting topic
          await db
            .insert(tagsTable)
            .values({ name: topicData.title })
            .onConflictDoNothing();

          await db.insert(topicsTable).values({
            ...topicRecord,
            postCount: 0,
            lastPostDate: null,
            createdAt: Date.now(),
          });

          console.log(
            `  Created topic and corresponding tag: ${topicData.title}`,
          );
        }

        topicsSyncedCount++;
      } catch (err) {
        topicsSkippedCount++;
        console.log(`  Failed to sync topic ${topicFilePath}:`, err);
      }
    }

    console.log(
      `Topics sync completed! Synced: ${topicsSyncedCount}, Skipped: ${topicsSkippedCount}`,
    );

    // 2. Sync posts ---------------------------------------------------------
    console.log('Starting content sync to database...');

    const postGlobPattern = path.join(
      projectRoot,
      'src/content/posts/**/*.{md,mdx}',
    );
    let postsSyncedCount = 0;
    let postsSkippedCount = 0;

    for await (const postFilePath of glob(postGlobPattern)) {
      try {
        const fileContent = await readFile(postFilePath, 'utf-8');
        const { frontmatter: rawFrontmatter, body } =
          extractFrontmatter(fileContent);
        const postData = parsePostFrontmatter(rawFrontmatter);

        if (!postData) {
          postsSkippedCount++;
          continue;
        }

        // Derive slug from file path relative to src/content/posts/
        const postsMarker = `src/content/posts/`;
        const postsIdx = postFilePath.indexOf(postsMarker);
        const slugWithExt =
          postsIdx !== -1
            ? postFilePath.slice(postsIdx + postsMarker.length)
            : path.basename(postFilePath);
        const slug = slugWithExt.replace(/\.(md|mdx)$/, '');

        const existingPost = await db
          .select()
          .from(postsTable)
          .where(eq(postsTable.slug, slug))
          .get();

        const postContentData: InsertPost = {
          slug,
          title: postData.title,
          summary: postData.summary,
          content: body.trim(),
          author: postData.author,
          topicTitle: postData.topicTitle,
          language: postData.language ?? 'en',
          timeToRead: postData.timeToRead ?? 1,
          status: postData.status,
          bannerImagePath: postData.bannerImagePath,
          isFeatured: postData.isFeatured ?? false,
        };

        let dbPost: typeof existingPost | { id: number } | undefined;
        let shouldSyncTags = false;

        if (existingPost) {
          const postTagsFromDb = (
            await db
              .select()
              .from(postsTagsTable)
              .where(eq(postsTagsTable.postId, existingPost.id))
          ).map(({ tagName }) => tagName);

          const newTagsSet = new Set(postData.tags ?? []);
          const existingTagsSet = new Set(postTagsFromDb);
          const tagsDifference = newTagsSet.difference(existingTagsSet);

          const someDataChanged =
            existingPost.title !== postContentData.title ||
            existingPost.summary !== postContentData.summary ||
            existingPost.content !== postContentData.content ||
            existingPost.author !== postContentData.author ||
            existingPost.topicTitle !== postContentData.topicTitle ||
            existingPost.language !== postContentData.language ||
            existingPost.timeToRead !== postContentData.timeToRead ||
            existingPost.status !== postContentData.status ||
            existingPost.bannerImagePath !== postContentData.bannerImagePath ||
            existingPost.isFeatured !== (postContentData.isFeatured ?? false) ||
            tagsDifference.size > 0 ||
            newTagsSet.size !== existingTagsSet.size;

          if (someDataChanged) {
            await db
              .update(postsTable)
              .set({
                ...postContentData,
                createdAt: existingPost.createdAt,
                deletedAt:
                  postContentData.status === 'deleted' &&
                  existingPost.status !== 'deleted' &&
                  !existingPost.deletedAt
                    ? Date.now()
                    : null,
                publishedAt:
                  postContentData.status === 'published' &&
                  existingPost.status !== 'published' &&
                  !existingPost.publishedAt
                    ? Date.now()
                    : existingPost.publishedAt,
                updatedAt: Date.now(),
              })
              .where(eq(postsTable.id, existingPost.id));

            dbPost = existingPost;
            shouldSyncTags = true;
          } else {
            dbPost = existingPost;
          }
        } else {
          const [insertedPost] = await db
            .insert(postsTable)
            .values({
              ...postContentData,
              createdAt: postData.createdAt.getTime(),
              updatedAt: (postData.updatedAt ?? postData.createdAt).getTime(),
              publishedAt:
                postData.publishedAt?.getTime() ??
                (postContentData.status === 'published'
                  ? postData.createdAt.getTime()
                  : null),
            })
            .returning();

          dbPost = insertedPost;
          shouldSyncTags = true;
        }

        if (!dbPost) {
          throw new Error(`Failed to insert or update post: ${postData.title}`);
        }

        if (shouldSyncTags) {
          await db
            .delete(postsTagsTable)
            .where(eq(postsTagsTable.postId, dbPost.id));

          const tags = postData.tags ?? [];
          if (tags.length > 0) {
            for (const tagName of tags) {
              await db
                .insert(tagsTable)
                .values({ name: tagName })
                .onConflictDoNothing();
            }

            await db
              .insert(postsTagsTable)
              .values(tags.map((tagName) => ({ postId: dbPost.id, tagName })));
          }
        }

        postsSyncedCount++;
        console.log(`  Synced post: ${postData.title}`);
      } catch (err) {
        postsSkippedCount++;
        console.log(`  Failed to sync post ${postFilePath}:`, err);
      }
    }

    console.log(
      `Content sync completed! Synced: ${postsSyncedCount}, Skipped: ${postsSkippedCount}`,
    );

    // 3. Update topic analytics ---------------------------------------------
    console.log('Updating topic analytics...');

    const topicStats = (await db
      .select({
        topicTitle: postsTable.topicTitle,
        postCount: sql`COUNT(*)`,
        lastPostDate: sql`MAX(${postsTable.publishedAt})`,
      })
      .from(postsTable)
      .where(eq(postsTable.status, 'published'))
      .groupBy(postsTable.topicTitle)) as {
      topicTitle: string;
      postCount: number;
      lastPostDate: number | null;
    }[];

    for (const stat of topicStats) {
      await db
        .update(topicsTable)
        .set({
          postCount: Number(stat.postCount),
          lastPostDate: stat.lastPostDate as number,
          updatedAt: Date.now(),
        })
        .where(eq(topicsTable.title, stat.topicTitle));
    }

    await db
      .update(topicsTable)
      .set({ postCount: 0, lastPostDate: null, updatedAt: Date.now() })
      .where(
        sql`${topicsTable.title} NOT IN (
          SELECT DISTINCT ${postsTable.topicTitle}
          FROM ${postsTable}
          WHERE ${postsTable.status} = 'published'
        )`,
      );

    console.log(`Updated analytics for ${topicStats.length} topics.`);
    console.log(
      `Complete sync finished! Topics: ${topicsSyncedCount}, Posts: ${postsSyncedCount}`,
    );

    return { success: true };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : 'buildSyncAllContent failed';
    console.log('Complete content sync failed:', err);
    return { success: false, error: message };
  }
}
