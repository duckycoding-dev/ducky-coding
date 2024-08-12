import type { PostContent } from '@ducky-coding/types/entities';
import { PostsService as DBPostsService } from '@ducky-coding/db/services';
import type { PostDTO } from '@ducky-coding/types/DTOs';

async function syncPostWithDatabase(post: PostContent, slug: string) {
  // const postDTO: PostDTO = {};
  // DBPostsService.upsertPostWithAuthorsAndTags(
  //   postDTO,
  //   post.authors.map((author) => author.username),
  //   post.tags,
  // );
}
