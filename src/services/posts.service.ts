import { PostsService as DBPostsService } from '@db/features/posts/posts.service';

const getPostBySlug = async (slug: string) => {
  return DBPostsService.getPostBySlug(slug);
};

export const PostsService = {
  getPostBySlug,
};
