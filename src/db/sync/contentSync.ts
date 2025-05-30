import { getCollection } from 'astro:content';
import { serverLogger } from '@utils/logs/logger';
import { db } from '../client';
import { postsTable } from '../features/posts/posts.model';
import { postsTagsTable } from '../features/posts/posts_tags.model';
import { tagsTable } from '../features/tags/tags.model';
import { topicsTable } from '../features/topics/topics.model';

import { sql } from 'drizzle-orm';
import { eq } from 'drizzle-orm';

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

        const topicData = {
          title: topic.data.title,
          slug: topic.data.slug,
          imagePath: topic.data.imagePath || null,
          description: topic.data.description,
          backgroundGradient: topic.data.backgroundGradient || null,
          externalLink: topic.data.externalLink || null,
          updatedAt: Math.floor(Date.now() / 1000),
        };

        if (existingTopic) {
          // Update existing topic (preserve analytics fields)
          await db
            .update(topicsTable)
            .set(topicData)
            .where(eq(topicsTable.title, existingTopic.title));

          serverLogger.debug(`🔄 Updated topic: ${topic.data.title}`);
        } else {
          // Insert new topic
          await db.insert(topicsTable).values({
            ...topicData,
            postCount: 0,
            lastPostDate: null,
            createdAt: Math.floor(Date.now() / 1000),
          });

          // Also create corresponding tag
          await db
            .insert(tagsTable)
            .values({ name: topic.data.title })
            .onConflictDoNothing();

          serverLogger.debug(`✨ Created topic: ${topic.data.title}`);
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

        const postData = {
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
          // Convert dates to timestamps if they exist
          publishedAt:
            post.data.status === 'published'
              ? Math.floor(Date.now() / 1000)
              : null,
          updatedAt: Math.floor(Date.now() / 1000),
        };

        let dbPost;
        if (existingPost) {
          // Update existing post
          await db
            .update(postsTable)
            .set(postData)
            .where(eq(postsTable.id, existingPost.id));
          dbPost = { ...existingPost, ...postData };
        } else {
          // Insert new post
          const [insertedPost] = await db
            .insert(postsTable)
            .values({
              ...postData,
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
    const topicStats = await db
      .select({
        topicTitle: postsTable.topicTitle,
        postCount: sql`COUNT(*)`,
        lastPostDate: sql`MAX(${postsTable.publishedAt})`,
      })
      .from(postsTable)
      .where(eq(postsTable.status, 'published'))
      .groupBy(postsTable.topicTitle);

    for (const stat of topicStats) {
      await db
        .update(topicsTable)
        .set({
          postCount: Number(stat.postCount),
          lastPostDate: stat.lastPostDate as number,
          updatedAt: Math.floor(Date.now() / 1000),
        })
        .where(eq(topicsTable.title, stat.topicTitle));
    }

    // Reset analytics for topics with no published posts
    await db.update(topicsTable).set({
      postCount: 0,
      lastPostDate: null,
      updatedAt: Math.floor(Date.now() / 1000),
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

/**
 * Verifies that topics referenced in posts exist in the database
 */
export async function ensureTopicsExist() {
  try {
    const posts = await getCollection('posts');
    const uniqueTopics = [
      ...new Set(posts.map((post) => post.data.topicTitle)),
    ];

    for (const topicTitle of uniqueTopics) {
      const existingTopic = await db
        .select()
        .from(topicsTable)
        .where(eq(topicsTable.title, topicTitle))
        .get();

      if (!existingTopic) {
        serverLogger.warn(
          `⚠️  Topic "${topicTitle}" referenced in posts but doesn't exist in database`,
        );
        // Optionally auto-create missing topics
        // await db.insert(topicsTable).values({
        //   title: topicTitle,
        //   slug: topicTitle.toLowerCase().replace(/\s+/g, '-'),
        // });
      }
    }
  } catch (error) {
    serverLogger.error('Failed to verify topics:', error);
  }
}

/**
 * Gets sync statistics
 */
export async function getSyncStats() {
  try {
    const [collectionCount] = await Promise.all([
      getCollection('posts').then((posts) => posts.length),
    ]);

    const resCount = await db.select({ count: sql`COUNT(*)` }).from(postsTable);
    const dbCount = (resCount[0]?.count as number) || 0;

    const resPublishedCount = await db
      .select({ publishedCount: sql`COUNT(*)` })
      .from(postsTable)
      .where(eq(postsTable.status, 'published'));

    const publishedCount =
      (resPublishedCount[0]?.publishedCount as number) || 0;

    return {
      collectionPosts: collectionCount,
      databasePosts: dbCount,
      publishedPosts: publishedCount,
      isInSync: collectionCount === dbCount,
    };
  } catch (error) {
    serverLogger.error('Failed to get sync stats:', error);
    return null;
  }
}
