import type { PostContent } from '@custom-types/entities';
import { PostsService as DBPostsService } from '@db/features/posts/posts.service';
import { ImagesService } from '@db/features/images/images.service';
import type { CreatePostDTO } from '@custom-types/DTOs';

export async function syncPostWithDatabase(post: PostContent, slug: string) {
  let bannerImage = await ImagesService.getImageByPath(post.bannerImage.path);
  if (!bannerImage) {
    bannerImage = await ImagesService.upsertImage(post.bannerImage);
  }

  const postDTO: CreatePostDTO = {
    content: post.content,
    title: post.title,
    slug,
    language: post.language,
    status: post.status,
    summary: post.summary,
    bannerImageId: bannerImage?.id,
    timeToRead: post.timeToRead,
    topicTitle: post.topic.title,
  };
  await DBPostsService.upsertPostWithAuthorsAndTags(
    postDTO,
    post.authors.map((author) => author.username),
    post.tags,
  );
}
