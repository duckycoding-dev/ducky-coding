import { eq, inArray } from 'drizzle-orm';
import { db } from '../../client';
import { postsTable, type Post } from './posts.model';
import { imagesTable, type Image } from '../images/images.model';
import { postsTagsTable } from './posts_tags.model';

const getPostsBySlugs = async (slugs: string[]): Promise<Post[]> => {
  const posts = await db
    .select()
    .from(postsTable)
    .where(inArray(postsTable.slug, slugs))
    .all();
  return posts;
};

const getPostsWithBannerBySlugs = async (
  slugs: string[],
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

const getPostTagsById = async (id: number): Promise<string[]> => {
  const tags = await db
    .select()
    .from(postsTagsTable)
    .where(eq(postsTagsTable.postId, id))
    .all();
  return tags.map((tag) => tag.tagName);
};

export const postsRepository = {
  getPostsBySlugs,
  getPostsWithBannerBySlugs,
  getPostTagsById,
};
