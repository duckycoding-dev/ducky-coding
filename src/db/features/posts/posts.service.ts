import { PostsRepository } from './posts.repository';

const getPostBySlug = async (
  slug: string,
): Promise<
  | Awaited<ReturnType<typeof PostsRepository.getPostsBySlugs>>[number]
  | undefined
> => {
  const [post] = await PostsRepository.getPostsBySlugs([slug]);
  return post;
};

const getPostWithBannerBySlug = async (
  slug: string,
): Promise<
  | Awaited<
      ReturnType<typeof PostsRepository.getPostsWithBannerBySlugs>
    >[number]
  | undefined
> => {
  const [post] = await PostsRepository.getPostsWithBannerBySlugs([slug]);
  return post;
};

const getPostsWithBannerBySlugs = async (
  slugs: string[],
): Promise<ReturnType<typeof PostsRepository.getPostsWithBannerBySlugs>> => {
  const post = await PostsRepository.getPostsWithBannerBySlugs(slugs);
  return post;
};

const getPostTagsById = async (postId: number): Promise<string[]> => {
  const tags = await PostsRepository.getPostTagsById(postId);
  return tags;
};

export const PostsService = {
  getPostWithBannerBySlug,
  getPostsWithBannerBySlugs,
  getPostTagsById,
  getPostBySlug,
};
