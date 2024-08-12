import { eq, inArray } from 'drizzle-orm';
import {
  PostDTO,
  PostTagDTO,
  PostWithAuthorAndBannerImageAndTagsDTO,
  PostWithAuthorAndBannerImageDTO,
} from '@ducky-coding/types/DTOs';
import { db } from '../client';
import {
  ImagesTable,
  mapToPostDTO,
  mapToPostTagDTO,
  PostsAuthorsTable,
  PostsTable,
  PostsTagsTable,
  UsersTable,
} from '../models';
import { mapToPostWithAuthorAndBannerImageDTO } from '../mappers/posts.mappers';
import { TagsRepository } from './tags.repository';

const getPosts = async (postIds: number[]): Promise<PostDTO[]> => {
  const posts = await db
    .select()
    .from(PostsTable)
    .where(inArray(PostsTable.id, postIds));

  const postDTOs = posts.map((post) => {
    return mapToPostDTO(post);
  });
  return postDTOs;
};

const getPostsBySlug = async (postSlugs: string[]): Promise<PostDTO[]> => {
  const posts = await db
    .select()
    .from(PostsTable)
    .where(inArray(PostsTable.slug, postSlugs));
  const postDTOs = posts.map((post) => {
    return mapToPostDTO(post);
  });
  return postDTOs;
};

const getAllPosts = async (): Promise<PostDTO[]> => {
  const posts = await db.select().from(PostsTable).all();
  const postDTOs = posts.map((post) => {
    return mapToPostDTO(post);
  });
  return postDTOs;
};

const getPostsWithAuthorAndBannerImageBySlugs = async (
  postSlugs: string[],
): Promise<PostWithAuthorAndBannerImageDTO[]> => {
  const posts = await db
    .select()
    .from(PostsTable)
    .where(inArray(PostsTable.slug, postSlugs));
  if (posts.length === 0) return [];

  const images = await db.select().from(ImagesTable).all();
  const authors = await db
    .select({
      postId: PostsAuthorsTable.postId,
      author: UsersTable,
    })
    .from(PostsAuthorsTable)
    .leftJoin(UsersTable, eq(PostsAuthorsTable.authorId, UsersTable.id))
    .all();

  const postsWithBannerImage = posts.map((post) => {
    const bannerImage =
      images.find((image) => image.id === post.bannerImageId) ?? null;
    return {
      posts: post,
      bannerImage,
    };
  });

  const postsWithAuthorAndBannerImage = postsWithBannerImage.map(
    (postWithBannerImage) => {
      const authorsForPost = authors.filter(
        (author) => author.postId === postWithBannerImage.posts.id,
      );
      return {
        post: postWithBannerImage.posts,
        authors: authorsForPost
          .map((author) => author.author)
          .filter((author) => author !== null),
        bannerImage: postWithBannerImage.bannerImage,
      };
    },
  );

  const postWithAuthorAndBannerImageDTOs = postsWithAuthorAndBannerImage.map(
    (postWithAuthorAndBannerImage) => {
      return mapToPostWithAuthorAndBannerImageDTO(
        postWithAuthorAndBannerImage.post,
        postWithAuthorAndBannerImage.authors,
        postWithAuthorAndBannerImage.bannerImage,
      );
    },
  );
  return postWithAuthorAndBannerImageDTOs;
};

const getAllPostsWithAuthorAndBannerImage = async (): Promise<
  PostWithAuthorAndBannerImageDTO[]
> => {
  const posts = await db.select().from(PostsTable).all();
  if (posts.length === 0) return [];

  const images = await db.select().from(ImagesTable).all();
  const authors = await db
    .select({
      postId: PostsAuthorsTable.postId,
      author: UsersTable,
    })
    .from(PostsAuthorsTable)
    .leftJoin(UsersTable, eq(PostsAuthorsTable.authorId, UsersTable.id))
    .all();

  const postsWithBannerImage = posts.map((post) => {
    const bannerImage =
      images.find((image) => image.id === post.bannerImageId) ?? null;
    return {
      posts: post,
      bannerImage,
    };
  });

  const postsWithAuthorAndBannerImage = postsWithBannerImage.map(
    (postWithBannerImage) => {
      const authorsForPost = authors.filter(
        (author) => author.postId === postWithBannerImage.posts.id,
      );
      return {
        post: postWithBannerImage.posts,
        authors: authorsForPost
          .map((author) => author.author)
          .filter((author) => author !== null),
        bannerImage: postWithBannerImage.bannerImage,
      };
    },
  );

  const postWithAuthorAndBannerImageDTOs = postsWithAuthorAndBannerImage.map(
    (postWithAuthorAndBannerImage) => {
      return mapToPostWithAuthorAndBannerImageDTO(
        postWithAuthorAndBannerImage.post,
        postWithAuthorAndBannerImage.authors,
        postWithAuthorAndBannerImage.bannerImage,
      );
    },
  );
  return postWithAuthorAndBannerImageDTOs;
};

const getPostsWithAuthorAndBannerImageAndTagsBySlugs = async (
  postSlugs: string[],
): Promise<PostWithAuthorAndBannerImageAndTagsDTO[]> => {
  const postsWithAuthorAndBannerImagePromise =
    getPostsWithAuthorAndBannerImageBySlugs(postSlugs);
  const tagsPromise = TagsRepository.getAllTags();
  const postsTagsPromise = db.select().from(PostsTagsTable);

  const promises = [
    postsWithAuthorAndBannerImagePromise,
    tagsPromise,
    postsTagsPromise,
  ] as const;
  const [postsWithAuthorAndBannerImage, tags, postsTags] =
    await Promise.all(promises);

  const postTagDTOs: PostTagDTO[] = postsTags.map((postTag) => {
    return mapToPostTagDTO(postTag);
  });

  const postWithAuthorAndBannerImageAndSlugsDTOs =
    postsWithAuthorAndBannerImage.map((postWithAuthorAndBannerImage) => {
      const filteredPostTags = postTagDTOs.filter(
        (postTag) => postTag.postId === postWithAuthorAndBannerImage.id,
      );
      const tagsForPost = tags
        .filter((tag) =>
          filteredPostTags.some((postTag) => postTag.tagName === tag.name),
        )
        .map((tag) => tag.name);
      return {
        ...postWithAuthorAndBannerImage,
        tags: tagsForPost,
      };
    });
  return postWithAuthorAndBannerImageAndSlugsDTOs;
};

const getAllPostsWithAuthorAndBannerImageAndTags = async (): Promise<
  PostWithAuthorAndBannerImageAndTagsDTO[]
> => {
  const postsWithAuthorAndBannerImagePromise =
    getAllPostsWithAuthorAndBannerImage();
  const tagsPromise = TagsRepository.getAllTags();
  const postsTagsPromise = db.select().from(PostsTagsTable);

  const promises = [
    postsWithAuthorAndBannerImagePromise,
    tagsPromise,
    postsTagsPromise,
  ] as const;
  const [postsWithAuthorAndBannerImage, tags, postsTags] =
    await Promise.all(promises);

  const postTagDTOs: PostTagDTO[] = postsTags.map((postTag) => {
    return mapToPostTagDTO(postTag);
  });

  const postWithAuthorAndBannerImageAndSlugsDTOs =
    postsWithAuthorAndBannerImage.map((postWithAuthorAndBannerImage) => {
      const filteredPostTags = postTagDTOs.filter(
        (postTag) => postTag.postId === postWithAuthorAndBannerImage.id,
      );
      const tagsForPost = tags
        .filter((tag) =>
          filteredPostTags.some((postTag) => postTag.tagName === tag.name),
        )
        .map((tag) => tag.name);
      return {
        ...postWithAuthorAndBannerImage,
        tags: tagsForPost,
      };
    });
  return postWithAuthorAndBannerImageAndSlugsDTOs;
};

export const PostsRepository = {
  getPosts,
  getPostsBySlug,
  getAllPosts,
  getPostsWithAuthorAndBannerImageBySlugs,
  getAllPostsWithAuthorAndBannerImage,
  getPostsWithAuthorAndBannerImageAndTagsBySlugs,
  getAllPostsWithAuthorAndBannerImageAndTags,
};
