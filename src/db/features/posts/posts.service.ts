import { postsRepository } from './posts.repository';

const getPostBySlug = async (
  slug: string,
): Promise<
  | Awaited<ReturnType<typeof postsRepository.getPostsBySlugs>>[number]
  | undefined
> => {
  const [post] = await postsRepository.getPostsBySlugs([slug]);
  return post;
};

const getPostWithBannerBySlug = async (
  slug: string,
): Promise<
  | Awaited<
      ReturnType<typeof postsRepository.getPostsWithBannerBySlugs>
    >[number]
  | undefined
> => {
  const [post] = await postsRepository.getPostsWithBannerBySlugs([slug]);
  return post;
};

const getPostsWithBannerBySlugs = async (
  slugs: string[],
): Promise<ReturnType<typeof postsRepository.getPostsWithBannerBySlugs>> => {
  const post = await postsRepository.getPostsWithBannerBySlugs(slugs);
  return post;
};

const getPostTagsById = async (postId: number): Promise<string[]> => {
  const tags = await postsRepository.getPostTagsById(postId);
  return tags;
};

export const postsService = {
  getPostWithBannerBySlug,
  getPostsWithBannerBySlugs,
  getPostTagsById,
  getPostBySlug,
};
