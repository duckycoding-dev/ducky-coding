import {
  PostDTO,
  PostWithAuthorAndBannerImageAndTagsDTO,
  PostWithAuthorAndBannerImageDTO,
} from '@ducky-coding/types/DTOs';
import { PostsRepository } from '../repositories/posts.repository';

const getPost = async (postId: number): Promise<PostDTO | undefined> => {
  const selectedPosts = await PostsRepository.getPosts([postId]);
  if (selectedPosts.length === 0) return undefined;

  const postDTO: PostDTO = selectedPosts[0];
  return postDTO;
};

const getPosts = async (postIds: number[]): Promise<PostDTO[]> => {
  const selectedPosts = await PostsRepository.getPosts(postIds);
  return selectedPosts;
};

const getPostsBySlug = async (slugs: string[]): Promise<PostDTO[]> => {
  const selectedTopics = await PostsRepository.getPostsBySlug(slugs);
  return selectedTopics;
};

const getAllPosts = async (): Promise<PostDTO[]> => {
  const selectedPosts = await PostsRepository.getAllPosts();
  return selectedPosts;
};

const getPostWithAuthorAndBannerImageBySlug = async (
  postSlug: string,
): Promise<PostWithAuthorAndBannerImageDTO | undefined> => {
  const selectedPostsWithAuthorAndBannerImage =
    await PostsRepository.getPostsWithAuthorAndBannerImageBySlugs([postSlug]);
  if (selectedPostsWithAuthorAndBannerImage.length === 0) return undefined;

  return selectedPostsWithAuthorAndBannerImage[0];
};

const getPostsWithAuthorAndBannerImageBySlugs = async (
  postSlugs: string[],
): Promise<PostWithAuthorAndBannerImageDTO[]> => {
  const selectedPostsWithAuthorAndBannerImage =
    await PostsRepository.getPostsWithAuthorAndBannerImageBySlugs(postSlugs);
  return selectedPostsWithAuthorAndBannerImage;
};

const getAllPostsWithAuthorAndBannerImage = async (): Promise<
  PostWithAuthorAndBannerImageDTO[]
> => {
  const selectedPostWithAuthorAndBannerImageAndTags =
    await PostsRepository.getAllPostsWithAuthorAndBannerImage();

  return selectedPostWithAuthorAndBannerImageAndTags;
};

const getPostWithAuthorAndBannerImageAndTagsBySlug = async (
  postSlug: string,
): Promise<PostWithAuthorAndBannerImageAndTagsDTO | undefined> => {
  const selectedPostsWithAuthorAndBannerImageAndTags =
    await PostsRepository.getPostsWithAuthorAndBannerImageAndTagsBySlugs([
      postSlug,
    ]);
  if (selectedPostsWithAuthorAndBannerImageAndTags.length === 0)
    return undefined;

  return selectedPostsWithAuthorAndBannerImageAndTags[0];
};

const getPostsWithAuthorAndBannerImageAndTagsBySlugs = async (
  postSlugs: string[],
): Promise<PostWithAuthorAndBannerImageAndTagsDTO[]> => {
  const selectedPostsWithAuthorAndBannerImageAndTags =
    await PostsRepository.getPostsWithAuthorAndBannerImageAndTagsBySlugs(
      postSlugs,
    );
  return selectedPostsWithAuthorAndBannerImageAndTags;
};

const getAllPostsWithAuthorAndBannerImageAndTags = async (): Promise<
  PostWithAuthorAndBannerImageAndTagsDTO[]
> => {
  const selectedPostWithAuthorAndBannerImageAndTags =
    await PostsRepository.getAllPostsWithAuthorAndBannerImageAndTags();

  return selectedPostWithAuthorAndBannerImageAndTags;
};

export const TopicsService = {
  getPost,
  getPosts,
  getPostsBySlug,
  getAllPosts,
  getPostWithAuthorAndBannerImageBySlug,
  getPostsWithAuthorAndBannerImageBySlugs,
  getAllPostsWithAuthorAndBannerImage,
  getPostWithAuthorAndBannerImageAndTagsBySlug,
  getPostsWithAuthorAndBannerImageAndTagsBySlugs,
  getAllPostsWithAuthorAndBannerImageAndTags,
};

// Add more methods as needed
