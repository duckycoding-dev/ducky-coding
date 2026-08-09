import { eq, inArray } from 'drizzle-orm';

import { getDb } from '../../client';
import type { Db } from '../../create-db';
import { type Image, imagesTable } from '../images/images.model';
import { type Post, postsTable } from './posts.model';
import { postsTagsTable } from './posts_tags.model';

const getPostsBySlugs = async (
  slugs: string[],
  db: Db = getDb(),
): Promise<Post[]> => {
  const posts = await db
    .select()
    .from(postsTable)
    .where(inArray(postsTable.slug, slugs))
    .all();
  return posts;
};

const getPostsWithBannerBySlugs = async (
  slugs: string[],
  db: Db = getDb(),
): Promise<{ post: Post; image: Image | null }[]> => {
  const postsWithBanner = await db
    .select({
      post: postsTable,
      image: imagesTable,
    })
    .from(postsTable)
    .leftJoin(imagesTable, eq(postsTable.bannerImagePath, imagesTable.path))
    .where(inArray(postsTable.slug, slugs))
    .all();
  return postsWithBanner;
};

const getPostTagsById = async (
  id: number,
  db: Db = getDb(),
): Promise<string[]> => {
  const tags = await db
    .select()
    .from(postsTagsTable)
    .where(eq(postsTagsTable.postId, id))
    .all();
  return tags.map((tag) => tag.tagName);
};

export const PostsRepository = {
  getPostsBySlugs,
  getPostsWithBannerBySlugs,
  getPostTagsById,
};
