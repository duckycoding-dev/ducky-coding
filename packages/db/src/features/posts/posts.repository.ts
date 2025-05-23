import { eq, inArray, sql } from 'drizzle-orm';
import type {
  PostAuthorDTO,
  PostDTO,
  PostTagDTO,
  PostWithAuthorAndBannerImageAndTagsDTO,
  PostWithAuthorAndBannerImageDTO,
} from '@ducky-coding/types/DTOs';
import { db } from '../../client';
import { mapToPostWithAuthorAndBannerImageDTO } from './posts.mappers';
import { TagsRepository } from '../tags/tags.repository';
import { ImagesTable } from '../images/images.model';
import { UsersTable } from '../users/users.model';
import { PostsTable, mapToPostDTO, type InsertPost } from './posts.model';
import {
  PostsAuthorsTable,
  type InsertPostAuthor,
  mapToPostAuthorDTO,
} from './posts_authors.model';
import {
  PostsTagsTable,
  mapToPostTagDTO,
  type InsertPostTag,
} from './posts_tags.model';

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

const insertPosts = async (posts: InsertPost[]): Promise<PostDTO[]> => {
  const insertedPosts = await db
    .insert(PostsTable)
    .values(
      posts.map((post) => {
        return {
          slug: post.slug,
          topicTitle: post.topicTitle,
          bannerImageId: post.bannerImageId,
          publishedAt:
            post.status === 'published' ? Math.floor(Date.now() / 1000) : null,
          content: post.content,
          language: post.language,
          summary: post.summary,
          title: post.title,
          timeToRead: post.timeToRead,
          status: post.status,
          createdAt: post.createdAt,
          updatedAt: post.updatedAt,
        };
      }),
    )
    .returning();

  return insertedPosts.map((insertedPost) => mapToPostDTO(insertedPost));
};

const insertPostAuthors = async (
  postAuthors: InsertPostAuthor[],
): Promise<PostAuthorDTO[]> => {
  const insertedPostAuthors = await db
    .insert(PostsAuthorsTable)
    .values(postAuthors)
    .returning();

  return insertedPostAuthors.map((insertedPostAuthor) => {
    return mapToPostAuthorDTO(insertedPostAuthor);
  });
};

const insertPostTags = async (
  postTags: InsertPostTag[],
): Promise<PostTagDTO[]> => {
  const insertedPostTags = await db
    .insert(PostsTagsTable)
    .values(postTags)
    .returning();

  return insertedPostTags.map((insertedPostTag) => {
    return mapToPostTagDTO(insertedPostTag);
  });
};

const deletePosts = async (postIds: number[]): Promise<PostDTO[]> => {
  const deletedPosts = await db
    .delete(PostsTable)
    .where(inArray(PostsTable.id, postIds))
    .returning();

  return deletedPosts.map((deletedPost) => mapToPostDTO(deletedPost));
};

const softDeletePosts = async (postIds: number[]): Promise<PostDTO[]> => {
  const now = Math.floor(Date.now() / 1000);
  const softDeletedPosts = await db
    .update(PostsTable)
    .set({
      deletedAt: now,
      status: 'deleted',
      updatedAt: now,
    })
    .where(inArray(PostsTable.id, postIds))
    .returning();

  return softDeletedPosts.map((deletedPost) => mapToPostDTO(deletedPost));
};

const deletePostAuthors = async (
  postIds: number[],
): Promise<PostAuthorDTO[]> => {
  const deletedPostAuthors = await db
    .delete(PostsAuthorsTable)
    .where(inArray(PostsAuthorsTable.postId, postIds))
    .returning();

  return deletedPostAuthors.map((deletedPostAuthor) => {
    return mapToPostAuthorDTO(deletedPostAuthor);
  });
};

const deletePostTags = async (postIds: number[]): Promise<PostTagDTO[]> => {
  const deletedPostTags = await db
    .delete(PostsTagsTable)
    .where(inArray(PostsTagsTable.postId, postIds))
    .returning();

  return deletedPostTags.map((deletedPostTag) => {
    return mapToPostTagDTO(deletedPostTag);
  });
};

const updatePost = async (post: PostDTO): Promise<PostDTO | undefined> => {
  const updatedPost = await db
    .update(PostsTable)
    .set({
      bannerImageId: post.bannerImageId,
      content: post.content,
      createdAt: post.createdAt,
      deletedAt: post.deletedAt,
      language: post.language,
      publishedAt: post.publishedAt,
      status: post.status,
      summary: post.summary,
      timeToRead: post.timeToRead,
      title: post.title,
      topicTitle: post.topicTitle,
      updatedAt: post.updatedAt,
      slug: post.slug,
    })
    .returning();

  if (updatedPost[0] === undefined) return undefined;
  return mapToPostDTO(updatedPost[0]);
};

const upsertPosts = async (posts: PostDTO[]): Promise<PostDTO[]> => {
  const updatedPosts = await db
    .insert(PostsTable)
    .values(posts)
    .onConflictDoUpdate({
      target: PostsTable.id,
      set: {
        bannerImageId: sql.raw(`excluded.${PostsTable.bannerImageId}`),
        content: sql.raw(`excluded.${PostsTable.content}`),
        createdAt: sql.raw(`excluded.${PostsTable.createdAt}`),
        deletedAt: sql.raw(`excluded.${PostsTable.deletedAt}`),
        language: sql.raw(`excluded.${PostsTable.language}`),
        publishedAt: sql.raw(`excluded.${PostsTable.publishedAt}`),
        status: sql.raw(`excluded.${PostsTable.status}`),
        summary: sql.raw(`excluded.${PostsTable.summary}`),
        timeToRead: sql.raw(`excluded.${PostsTable.timeToRead}`),
        title: sql.raw(`excluded.${PostsTable.title}`),
        topicTitle: sql.raw(`excluded.${PostsTable.topicTitle}`),
        updatedAt: sql.raw(`excluded.${PostsTable.updatedAt}`),
        slug: sql.raw(`excluded.${PostsTable.slug}`),
      },
    })
    .returning();

  return updatedPosts.map((updatedPost) => mapToPostDTO(updatedPost));
};

export const PostsRepository = {
  getPosts,
  getPostsBySlug,
  getAllPosts,
  getPostsWithAuthorAndBannerImageBySlugs,
  getAllPostsWithAuthorAndBannerImage,
  getPostsWithAuthorAndBannerImageAndTagsBySlugs,
  getAllPostsWithAuthorAndBannerImageAndTags,

  insertPosts,
  insertPostAuthors,
  insertPostTags,
  deletePosts,
  softDeletePosts,
  deletePostAuthors,
  deletePostTags,
  updatePost,
  upsertPosts,
};
