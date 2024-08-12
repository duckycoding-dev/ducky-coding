import {
  CreatePostDTO,
  CreatePostDTOSchema,
  PostAuthorDTO,
  PostDTO,
  PostDTOSchema,
  PostTagDTO,
  PostWithAuthorAndBannerImageAndTagsDTO,
  PostWithAuthorAndBannerImageDTO,
} from '@ducky-coding/types/DTOs';
import { PostsRepository } from '../repositories/posts.repository';
import { InsertPost } from '../models';
import { UsersService } from './users.service';

const getPost = async (postId: number): Promise<PostDTO | undefined> => {
  const selectedPosts = await PostsRepository.getPosts([postId]);
  if (selectedPosts.length === 0) return undefined;

  const postDTO: PostDTO = selectedPosts[0];
  return postDTO;
};

const getPostBySlug = async (slug: string): Promise<PostDTO | undefined> => {
  const selectedPosts = await PostsRepository.getPostsBySlug([slug]);
  if (selectedPosts.length === 0) return undefined;
  return selectedPosts[0];
};

const getPosts = async (postIds: number[]): Promise<PostDTO[]> => {
  const selectedPosts = await PostsRepository.getPosts(postIds);
  return selectedPosts;
};

const getPostsBySlug = async (slugs: string[]): Promise<PostDTO[]> => {
  const selectedPosts = await PostsRepository.getPostsBySlug(slugs);
  return selectedPosts;
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

const insertPost = async (
  post: CreatePostDTO,
): Promise<PostDTO | undefined> => {
  const parsedPost = CreatePostDTOSchema.parse(post);
  const postToInsert: InsertPost = {
    content: parsedPost.content,
    language: parsedPost.language,
    publishedAt: parsedPost.publishedAt,
    slug: parsedPost.slug,
    status: parsedPost.status,
    summary: parsedPost.summary,
    timeToRead: parsedPost.timeToRead,
    title: parsedPost.title,
    topicTitle: parsedPost.topicTitle,
    bannerImageId: parsedPost?.bannerImageId,
  };
  const insertedPost = await PostsRepository.insertPosts([postToInsert]);

  if (insertedPost.length === 0) return undefined;
  return insertedPost[0];
};

const insertPostAuthors = async (
  postId: number,
  authorsIds: number[],
): Promise<PostAuthorDTO[]> => {
  const insertedPostAuthors = await PostsRepository.insertPostAuthors(
    authorsIds.map((authorId) => {
      return {
        postId,
        authorId,
      };
    }),
  );
  return insertedPostAuthors;
};

const insertPostTags = async (
  postId: number,
  tags: string[],
): Promise<PostTagDTO[]> => {
  const insertedPostTags = await PostsRepository.insertPostTags(
    tags.map((tag) => {
      return {
        postId,
        tagName: tag,
      };
    }),
  );

  return insertedPostTags;
};

const updatePost = async (post: PostDTO): Promise<PostDTO | undefined> => {
  const parsedPost = PostDTOSchema.parse(post);

  const updatedPost = await PostsRepository.updatePost({
    ...parsedPost,
    updatedAt: Math.floor(Date.now() / 1000),
  });
  return updatedPost;
};

const upsertPost = async (post: PostDTO): Promise<PostDTO | undefined> => {
  const upsertedPosts = await PostsRepository.upsertPosts([post]);
  if (upsertedPosts.length === 0) return undefined;
  return upsertedPosts[0];
};

const upsertPosts = async (posts: PostDTO[]): Promise<PostDTO[]> => {
  const upsertedPosts = await PostsRepository.upsertPosts(posts);
  return upsertedPosts;
};

const updatePostAuthors = async (
  postId: number,
  authorIds: number[],
): Promise<PostAuthorDTO[]> => {
  await PostsRepository.deletePostAuthors([postId]);
  const insertedPostAuthors = await insertPostAuthors(postId, authorIds);
  return insertedPostAuthors;
};

const updatePostTags = async (
  postId: number,
  tags: string[],
): Promise<PostTagDTO[]> => {
  await PostsRepository.deletePostTags([postId]);
  const insertedPostTags = await insertPostTags(postId, tags);
  return insertedPostTags;
};

const upsertPostWithAuthorsAndTags = async (
  post: CreatePostDTO,
  authorsUsernames: string[],
  tags: string[],
): Promise<PostDTO | undefined> => {
  const parsedPost = CreatePostDTOSchema.parse(post);
  const existingPost = await getPostBySlug(parsedPost.slug);

  if (!existingPost) {
    // Insert new post
    const insertedPost = await insertPost(parsedPost);
    if (!insertedPost) return undefined; // throw new Error('Failed to insert post');
    // Insert author and tag relationships
    await insertPostTags(insertedPost.id, tags);

    const authors = await UsersService.getUsersByUsernames(authorsUsernames);
    await insertPostAuthors(
      insertedPost.id,
      authors.map((author) => author.id),
    );

    return insertedPost;
  }
  // Update existing post if needed
  const updatedPost = await updatePost({
    ...parsedPost,
    id: existingPost.id,
    updatedAt: Math.floor(Date.now() / 1000),
    createdAt: existingPost.createdAt,
  });

  if (!updatedPost) return undefined; // throw new Error('Failed to update post');
  // Update author and tag relationships
  await updatePostTags(updatedPost.id, tags);
  const authors = await UsersService.getUsersByUsernames(authorsUsernames);
  await updatePostAuthors(
    updatedPost.id,
    authors.map((author) => author.id),
  );
  // await ImagesService.upsertImage(parsedPost.slug, parsedPost.authors);

  return updatedPost;
};

export const PostsService = {
  getPost,
  getPostBySlug,
  getPosts,
  getPostsBySlug,
  getAllPosts,
  getPostWithAuthorAndBannerImageBySlug,
  getPostsWithAuthorAndBannerImageBySlugs,
  getAllPostsWithAuthorAndBannerImage,
  getPostWithAuthorAndBannerImageAndTagsBySlug,
  getPostsWithAuthorAndBannerImageAndTagsBySlugs,
  getAllPostsWithAuthorAndBannerImageAndTags,

  insertPost,
  updatePost,
  upsertPost,
  upsertPosts,
  upsertPostWithAuthorsAndTags,
};

// Add more methods as needed
