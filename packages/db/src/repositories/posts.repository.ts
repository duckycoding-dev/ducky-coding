import { eq, inArray } from 'drizzle-orm';
import { db } from '../client';
import { PostsAuthorsTable, PostsTable, UsersTable } from '../models';

const getPosts = async (postIds: number[]) => {
  const posts = await db
    .select()
    .from(PostsTable)
    .where(inArray(PostsTable.id, postIds));
  return posts;
};

const getPostsBySlug = async (postSlugs: string[]) => {
  const posts = await db
    .select()
    .from(PostsTable)
    .where(inArray(PostsTable.slug, postSlugs));
  return posts;
};

const getAllPosts = async () => {
  const posts = await db.select().from(PostsTable).all();
  return posts;
};

const getAllPostsWithAuthorAndBannerImage = async () => {
  const posts = await db
    .select()
    .from(PostsTable)
    .leftJoin(PostsAuthorsTable, eq(PostsTable.id, PostsAuthorsTable.postId))
    .leftJoin(UsersTable, eq(PostsAuthorsTable.authorId, UsersTable.id))
    .all();
  return posts;
};

export const PostsRepository = {
  getPosts,
  getPostsBySlug,
  getAllPosts,
  getAllPostsWithAuthorAndBannerImage,
};
