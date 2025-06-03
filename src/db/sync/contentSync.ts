import { getCollection } from 'astro:content';
import { serverLogger } from '@utils/logs/logger';
import { db } from '../client';
import { postsTable } from '../features/posts/posts.model';
import { postsTagsTable } from '../features/posts/posts_tags.model';
import { tagsTable } from '../features/tags/tags.model';
import { topicsTable } from '../features/topics/topics.model';

import { sql } from 'drizzle-orm';
import { eq } from 'drizzle-orm';
import { imagesTable } from '../features/images/images.model';

/**
 * Syncs topics from content collection to database
 * This ensures topics exist before syncing posts
 */
export async function syncTopicsToDatabase(): Promise<
  | {
      success: true;
      syncedCount: number;
      skippedCount: number;
      totalTopics: number;
    }
  | { success: false; error: string }
> {
  try {
    serverLogger.info('📚 Starting topics sync to database...');

    const topics = await getCollection('topics');
    let syncedCount = 0;
    let skippedCount = 0;

    for (const topic of topics) {
      try {
        // Check if topic already exists
        const existingTopic = await db
          .select()
          .from(topicsTable)
          .where(eq(topicsTable.title, topic.data.title))
          .get();

        const topicJsonData = {
          title: topic.data.title,
          slug: topic.data.slug,
          imagePath: topic.data.imagePath || null,
          description: topic.data.description,
          backgroundGradient: topic.data.backgroundGradient || null,
          externalLink: topic.data.externalLink || null,
          updatedAt: Date.now(),
        };

        if (existingTopic) {
          // Update existing topic (preserve analytics fields)
          let someDataChanged = false;
          if (
            existingTopic.slug !== topicJsonData.slug ||
            existingTopic.imagePath !== topicJsonData.imagePath ||
            existingTopic.description !== topicJsonData.description ||
            existingTopic.backgroundGradient !==
              topicJsonData.backgroundGradient ||
            existingTopic.externalLink !== topicJsonData.externalLink
          ) {
            someDataChanged = true;
          }
          if (someDataChanged) {
            await db
              .update(topicsTable)
              .set(topicJsonData)
              .where(eq(topicsTable.title, existingTopic.title));

            serverLogger.debug(`🔄 Updated topic: ${topic.data.title}`);
          }
        } else {
          // A tag with the same name must exist before inserting a new topic
          await db
            .insert(tagsTable)
            .values({ name: topic.data.title })
            .onConflictDoNothing();

          // Insert new topic
          await db.insert(topicsTable).values({
            ...topicJsonData,
            postCount: 0,
            lastPostDate: null,
            createdAt: Date.now(),
          });

          serverLogger.debug(
            `✨ Created topic and corresponding tag: ${topic.data.title}`,
          );
        }

        syncedCount++;
      } catch (error) {
        skippedCount++;
        serverLogger.error(
          `❌ Failed to sync topic ${topic.data.title}:`,
          error,
        );
      }
    }

    serverLogger.info(
      `📚 Topics sync completed! Synced: ${syncedCount}, Skipped: ${skippedCount}`,
    );

    return {
      success: true,
      syncedCount,
      skippedCount,
      totalTopics: topics.length,
    };
  } catch (error) {
    serverLogger.error('💥 Topics sync failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Syncs content from Astro content collections to the database
 * This creates a searchable index while keeping Markdown as source of truth
 */
export async function syncContentToDatabase(): Promise<
  | {
      success: true;
      syncedCount: number;
      skippedCount: number;
      totalPosts: number;
    }
  | {
      success: false;
      error: string;
    }
> {
  try {
    serverLogger.info('🔄 Starting content sync to database...');

    const posts = await getCollection('posts');
    let syncedCount = 0;
    let skippedCount = 0;

    for (const post of posts) {
      try {
        // Check if post already exists
        const existingPost = await db
          .select()
          .from(postsTable)
          .where(eq(postsTable.slug, post.id))
          .get();

        const postContentData = {
          slug: post.id,
          title: post.data.title,
          summary: post.data.summary,
          content: post.body, // Full markdown content for search
          author: post.data.author,
          topicTitle: post.data.topicTitle,
          language: post.data.language || 'en',
          timeToRead: post.data.timeToRead || 1,
          status: post.data.status,
          bannerImagePath: post.data.bannerImagePath,
        };

        let dbPost;
        if (existingPost) {
          const postTagsFromDb = (
            await db
              .select()
              .from(postsTagsTable)
              .where(eq(postsTagsTable.postId, existingPost.id))
          ).map(({ tagName }) => tagName);
          // Update existing post
          let someDataChanged = false;
          if (
            existingPost.title !== postContentData.title ||
            existingPost.summary !== postContentData.summary ||
            existingPost.content !== postContentData.content ||
            existingPost.author !== postContentData.author ||
            existingPost.topicTitle !== postContentData.topicTitle ||
            existingPost.language !== postContentData.language ||
            existingPost.timeToRead !== postContentData.timeToRead ||
            existingPost.status !== postContentData.status ||
            existingPost.bannerImagePath !== postContentData.bannerImagePath
          ) {
            someDataChanged = true;
          }

          const newTagsSet = new Set(post.data.tags || []);
          const existingTagsSet = new Set(postTagsFromDb);
          const tagsDifference = newTagsSet.difference(existingTagsSet);
          if (
            tagsDifference.size > 0 ||
            newTagsSet.size !== existingTagsSet.size
          ) {
            someDataChanged = true;
          }

          if (someDataChanged) {
            await db
              .update(postsTable)
              .set({ ...postContentData, updatedAt: Date.now() })
              .where(eq(postsTable.id, existingPost.id));
            dbPost = { ...existingPost, ...postContentData };
          }
          dbPost = existingPost; // Use existing post if no changes
        } else {
          // Insert new post
          const [insertedPost] = await db
            .insert(postsTable)
            .values({
              ...postContentData,
              content: post.body ?? '', // Store full content for search
            })
            .returning();
          dbPost = insertedPost;
        }
        if (!dbPost) {
          throw new Error(
            `Failed to insert or update post: ${post.data.title}`,
          );
        }

        // Sync tags - remove existing and add new ones
        await db
          .delete(postsTagsTable)
          .where(eq(postsTagsTable.postId, dbPost.id));

        if (post.data.tags && post.data.tags.length > 0) {
          // Ensure all tags exist in tags table
          for (const tagName of post.data.tags) {
            await db
              .insert(tagsTable)
              .values({ name: tagName })
              .onConflictDoNothing();
          }

          // Link post to tags
          const tagRelations = post.data.tags.map((tagName) => ({
            postId: dbPost.id,
            tagName: tagName,
          }));

          // Insert new tag relations
          await db.insert(postsTagsTable).values(tagRelations);
        }

        syncedCount++;
        serverLogger.debug(`✅ Synced post: ${post.data.title}`);
      } catch (error) {
        skippedCount++;
        serverLogger.error(`❌ Failed to sync post ${post.id}:`, error);
      }
    }

    serverLogger.info(
      `🎉 Content sync completed! Synced: ${syncedCount}, Skipped: ${skippedCount}`,
    );

    return {
      success: true,
      syncedCount,
      skippedCount,
      totalPosts: posts.length,
    };
  } catch (error) {
    serverLogger.error('💥 Content sync failed:', error);
    const typedError =
      error instanceof Error ? error : new Error('Content sync failed');
    return {
      success: false,
      error: typedError.message,
    };
  }
}

/**
 * Updates topic analytics after posts sync
 */
export async function updateTopicAnalytics() {
  try {
    serverLogger.info('📊 Updating topic analytics...');

    // Get post counts and last post dates per topic
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

    // Reset analytics for topics with no published posts
    await db.update(topicsTable).set({
      postCount: 0,
      lastPostDate: null,
      updatedAt: Date.now(),
    }).where(sql`${topicsTable.title} NOT IN (
        SELECT DISTINCT ${postsTable.topicTitle}
        FROM ${postsTable}
        WHERE ${postsTable.status} = 'published'
      )`);

    serverLogger.info(`📊 Updated analytics for ${topicStats.length} topics`);
  } catch (error) {
    serverLogger.error('Failed to update topic analytics:', error);
  }
}

/**
 * Complete content sync: topics first, then posts, then analytics
 */
export async function syncAllContent() {
  try {
    serverLogger.info('🚀 Starting complete content sync...');

    // 1. Sync topics first
    const topicsResult = await syncTopicsToDatabase();
    if (!topicsResult) throw new Error('Failed to sync topics');
    if (!topicsResult.success) {
      throw new Error(`Topics sync failed: ${topicsResult.error}`);
    }

    // 2. Sync posts
    const postsResult = await syncContentToDatabase();
    if (!postsResult) throw new Error('Failed to sync posts');
    if (!postsResult.success) {
      throw new Error(`Posts sync failed: ${postsResult.error}`);
    }

    // 3. Update topic analytics
    await updateTopicAnalytics();

    const totalSynced = topicsResult.syncedCount + postsResult.syncedCount;
    serverLogger.info(
      `🎉 Complete sync finished! Total synced: ${totalSynced} items`,
    );

    return {
      success: true,
      topics: topicsResult,
      posts: postsResult,
      totalSynced,
    };
  } catch (error) {
    serverLogger.error('💥 Complete content sync failed:', error);
    const typedError =
      error instanceof Error
        ? error
        : new Error('Complete content sync failed');
    return {
      success: false,
      error: typedError.message,
    };
  }
}

export const syncImages = async (): Promise<{
  message?: string;
  imagesAdded: number;
}> => {
  try {
    serverLogger.info('🔄 Starting image sync to database...');
    const images = import.meta.glob(
      '../../assets/images/**/*.{png,jpg,jpeg,gif,svg}',
      {
        eager: true,
        import: 'default',
      },
    );
    const relativePathsToAddToDb = Object.keys(images)
      .map((key) => key.split('assets/images/').pop())
      .filter((path) => path !== undefined);

    serverLogger.info(
      `🎨 Found ${relativePathsToAddToDb.length} images to sync:`,
      relativePathsToAddToDb,
    );
    if (relativePathsToAddToDb.length === 0) {
      serverLogger.info('No images found to sync.');
      return { imagesAdded: 0, message: 'No images found to sync.' };
    }

    const resultOfInsert = await db
      .insert(imagesTable)
      .values(relativePathsToAddToDb.map((path) => ({ path })))
      .onConflictDoNothing();

    if (resultOfInsert.rowsAffected > 0) {
      serverLogger.info(
        `🎨 Synced ${resultOfInsert.rowsAffected} new images to database.`,
      );
      serverLogger.info(`New images: ${resultOfInsert.rowsAffected}`);
      serverLogger.info(
        'CAREFUL: alt texts must be added manually to the db (or think about managing images as json collections as done with topics!)',
      );
    }
    return {
      imagesAdded: resultOfInsert.rowsAffected,
      message: 'Images synced successfully.',
    };
  } catch (error) {
    serverLogger.error('Failed to sync images:', error);
    throw new Error('Failed to sync images');
  }
};
