import { PostsService as DBPostsService } from '@ducky-coding/db/services';

const getPostBySlug = async (slug: string) => {
  return DBPostsService.getPostBySlug(slug);
};

export const PostsService = {
  getPostBySlug,
};
