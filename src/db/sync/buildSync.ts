/**
 * Build-time DB sync module for use in Astro integration hooks.
 *
 * Uses Node APIs (node:fs/promises glob, yaml package, Zod schemas)
 * instead of Vite/Astro virtual modules (import.meta.glob, getCollection).
 *
 * Compatible with Node 22+ (native glob in node:fs/promises).
 */

import { createClient } from '@libsql/client';
import { eq, inArray, notInArray, sql } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/libsql';
import { migrate } from 'drizzle-orm/libsql/migrator';
import { glob, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse as parseYaml } from 'yaml';

import { MemeContentSchema } from '../../types/entities/memeContent.entity.ts';
import { PostContentSchema } from '../../types/entities/postContent.entity.ts';
import { TopicContentSchema } from '../../types/entities/topicContent.entity.ts';
import { imagesTable } from '../features/images/images.model.ts';
import { type InsertMeme, memesTable } from '../features/memes/memes.model.ts';
import { type InsertPost, postsTable } from '../features/posts/posts.model.ts';
import { postsTagsTable } from '../features/posts/posts_tags.model.ts';
import { tagsTable } from '../features/tags/tags.model.ts';
import { topicsTable } from '../features/topics/topics.model.ts';

// ---------------------------------------------------------------------------
// Standalone DB client (no import.meta.env / Vite path aliases)
// ---------------------------------------------------------------------------

export interface BuildSyncDbConfig {
  url: string;
  authToken?: string;
}

function createDb(config: BuildSyncDbConfig) {
  const turso = createClient({ url: config.url, authToken: config.authToken });
  return drizzle({ client: turso, casing: 'snake_case' });
}

// ---------------------------------------------------------------------------
// buildMigrate
// ---------------------------------------------------------------------------

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export async function buildMigrate(dbConfig: BuildSyncDbConfig): Promise<{
  success: boolean;
  error?: string;
}> {
  console.log('Running database migrations (build)...');

  try {
    const db = createDb(dbConfig);
    const migrationsFolder = path.join(__dirname, '../migrations');
    await migrate(db, { migrationsFolder });
    console.log('Migrations completed successfully.');
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Migration failed';
    // Non-fatal: log warning and continue — tables may already exist
    // (e.g., created via drizzle-kit push)
    console.warn('Migration warning:', message);
    return { success: false, error: message };
  }
}

// ---------------------------------------------------------------------------
// Frontmatter helpers
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// buildSyncImages
// ---------------------------------------------------------------------------

export async function buildSyncImages(dbConfig: BuildSyncDbConfig): Promise<{
  imagesAdded: number;
  message?: string;
}> {
  console.log('Starting image sync to database (build)...');

  const db = createDb(dbConfig);
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

  // Remove image records whose files no longer exist on disk
  if (relativePaths.length > 0) {
    const deleted = await db
      .delete(imagesTable)
      .where(notInArray(imagesTable.path, relativePaths));
    if (deleted.rowsAffected > 0) {
      console.log(`Removed ${deleted.rowsAffected} orphaned image records.`);
    }
  }

  return {
    imagesAdded: result.rowsAffected,
    message: 'Images synced successfully.',
  };
}

// ---------------------------------------------------------------------------
// buildSyncAllContent
// ---------------------------------------------------------------------------

export async function buildSyncAllContent(
  dbConfig: BuildSyncDbConfig,
): Promise<{
  success: boolean;
  error?: string;
}> {
  console.log('Starting complete content sync (build)...');

  try {
    const db = createDb(dbConfig);
    const projectRoot = process.cwd();

    // 1. Sync topics --------------------------------------------------------
    console.log('Starting topics sync to database...');

    const topicGlobPattern = path.join(
      projectRoot,
      'src/content/topics/**/*.json',
    );
    let topicsSyncedCount = 0;
    let topicsSkippedCount = 0;
    const syncedTitles: string[] = [];

    for await (const topicFilePath of glob(topicGlobPattern)) {
      try {
        const fileContent = await readFile(topicFilePath, 'utf-8');
        const parsed = TopicContentSchema.safeParse(JSON.parse(fileContent));
        if (!parsed.success) {
          console.log(
            `  Skipping topic ${topicFilePath}: ${parsed.error.message}`,
          );
          topicsSkippedCount++;
          continue;
        }
        const topicData = parsed.data;

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

        syncedTitles.push(topicData.title);
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
    const syncedSlugs: string[] = [];

    for await (const postFilePath of glob(postGlobPattern)) {
      try {
        const fileContent = await readFile(postFilePath, 'utf-8');
        const { frontmatter: rawFrontmatter, body } =
          extractFrontmatter(fileContent);
        const parsed = PostContentSchema.safeParse(parseYaml(rawFrontmatter));
        if (!parsed.success) {
          console.log(
            `  Skipping post ${postFilePath}: ${parsed.error.message}`,
          );
          postsSkippedCount++;
          continue;
        }
        const postData = parsed.data;

        // Derive slug from file path relative to src/content/posts/
        const postsMarker = `src/content/posts/`;
        const postsIdx = postFilePath.indexOf(postsMarker);
        const slugWithExt =
          postsIdx !== -1
            ? postFilePath.slice(postsIdx + postsMarker.length)
            : path.basename(postFilePath);
        const slug = slugWithExt
          .replace(/\.(md|mdx)$/, '')
          .replace(/\/index$/, '');

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

          const frontmatterUpdatedAt = (
            postData.updatedAt ?? postData.createdAt
          ).getTime();

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
            existingPost.updatedAt !== frontmatterUpdatedAt ||
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
                updatedAt: frontmatterUpdatedAt,
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

        syncedSlugs.push(slug);
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

    // 3. Sync memes --------------------------------------------------------
    console.log('Starting memes sync to database...');

    const memeGlobPattern = path.join(
      projectRoot,
      'src/content/memes/**/*.{md,mdx}',
    );
    let memesSyncedCount = 0;
    let memesSkippedCount = 0;
    const syncedMemeSlugs: string[] = [];

    for await (const memeFilePath of glob(memeGlobPattern)) {
      try {
        const fileContent = await readFile(memeFilePath, 'utf-8');
        const { frontmatter: rawFrontmatter } = extractFrontmatter(fileContent);
        const parsed = MemeContentSchema.safeParse(parseYaml(rawFrontmatter));
        if (!parsed.success) {
          console.log(
            `  Skipping meme ${memeFilePath}: ${parsed.error.message}`,
          );
          memesSkippedCount++;
          continue;
        }
        const memeData = parsed.data;

        const memesMarker = `src/content/memes/`;
        const memesIdx = memeFilePath.indexOf(memesMarker);
        const slugWithExt =
          memesIdx !== -1
            ? memeFilePath.slice(memesIdx + memesMarker.length)
            : path.basename(memeFilePath);
        const slug = slugWithExt
          .replace(/\.(md|mdx)$/, '')
          .replace(/\/index$/, '');

        const existingMeme = await db
          .select()
          .from(memesTable)
          .where(eq(memesTable.slug, slug))
          .get();

        const memeRecord: InsertMeme = {
          slug,
          title: memeData.title,
          author: memeData.author,
          imagePath: memeData.imagePath,
          imageAlt: memeData.imageAlt,
          tags: JSON.stringify(memeData.tags ?? []),
          createdAt: memeData.createdAt,
        };

        if (existingMeme) {
          const changed =
            existingMeme.title !== memeRecord.title ||
            existingMeme.author !== memeRecord.author ||
            existingMeme.imagePath !== memeRecord.imagePath ||
            existingMeme.imageAlt !== memeRecord.imageAlt ||
            existingMeme.tags !== memeRecord.tags ||
            existingMeme.createdAt !== memeRecord.createdAt;

          if (changed) {
            await db
              .update(memesTable)
              .set(memeRecord)
              .where(eq(memesTable.id, existingMeme.id));
            console.log(`  Updated meme: ${memeData.title}`);
          }
        } else {
          await db.insert(memesTable).values(memeRecord);
          console.log(`  Created meme: ${memeData.title}`);
        }

        syncedMemeSlugs.push(slug);
        memesSyncedCount++;
      } catch (err) {
        memesSkippedCount++;
        console.log(`  Failed to sync meme ${memeFilePath}:`, err);
      }
    }

    console.log(
      `Memes sync completed! Synced: ${memesSyncedCount}, Skipped: ${memesSkippedCount}`,
    );

    // 4. Orphan cleanup --------------------------------------------------------
    console.log('Cleaning up orphaned records...');

    // Hard-delete posts whose content file no longer exists
    if (syncedSlugs.length > 0) {
      const orphanedPosts = await db
        .select({ id: postsTable.id, slug: postsTable.slug })
        .from(postsTable)
        .where(notInArray(postsTable.slug, syncedSlugs));
      if (orphanedPosts.length > 0) {
        const orphanedIds = orphanedPosts.map((r) => r.id);
        const orphanedSlugs = orphanedPosts.map((r) => r.slug);
        // Explicitly remove post-tag relations before deleting posts,
        // since libsql does not reliably trigger ON DELETE CASCADE.
        await db
          .delete(postsTagsTable)
          .where(inArray(postsTagsTable.postId, orphanedIds));
        await db
          .delete(postsTable)
          .where(notInArray(postsTable.slug, syncedSlugs));
        console.log(
          `  Removed ${orphanedSlugs.length} orphaned post(s): ${orphanedSlugs.join(', ')}`,
        );
      }
    }

    // Hard-delete memes whose content file no longer exists
    if (syncedMemeSlugs.length > 0) {
      const deletedMemes = await db
        .delete(memesTable)
        .where(notInArray(memesTable.slug, syncedMemeSlugs));
      if (deletedMemes.rowsAffected > 0) {
        console.log(`  Removed ${deletedMemes.rowsAffected} orphaned meme(s).`);
      }
    }

    // Hard-delete topics whose JSON file no longer exists
    if (syncedTitles.length > 0) {
      const deletedTopics = await db
        .delete(topicsTable)
        .where(notInArray(topicsTable.title, syncedTitles));
      if (deletedTopics.rowsAffected > 0) {
        console.log(
          `  Removed ${deletedTopics.rowsAffected} orphaned topic(s).`,
        );
      }
    }

    // Delete tags not referenced by any post-tag relation and not a topic title.
    // posts_tags rows are already cascade-deleted when their post was deleted above.
    const deletedTags = await db.delete(tagsTable).where(
      sql`${tagsTable.name} NOT IN (SELECT DISTINCT tag_name FROM posts_tags)
          AND ${tagsTable.name} NOT IN (SELECT title FROM topics)`,
    );
    if (deletedTags.rowsAffected > 0) {
      console.log(`  Removed ${deletedTags.rowsAffected} orphaned tag(s).`);
    }

    console.log('Orphan cleanup complete.');

    // 5. Update topic analytics ---------------------------------------------
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
      `Complete sync finished! Topics: ${topicsSyncedCount}, Posts: ${postsSyncedCount}, Memes: ${memesSyncedCount}`,
    );

    return { success: true };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : 'buildSyncAllContent failed';
    console.log('Complete content sync failed:', err);
    return { success: false, error: message };
  }
}
