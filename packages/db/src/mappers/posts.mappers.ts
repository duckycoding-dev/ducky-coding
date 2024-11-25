import type { PostWithAuthorAndBannerImageDTO } from '@ducky-coding/types/DTOs';
import {
  type Image,
  mapToImageDTO,
  mapToPostDTO,
  mapToUserDTO,
  type Post,
  type User,
} from '../models';

export function mapToPostWithAuthorAndBannerImageDTO(
  selectedPost: Post,
  users: User[] | null,
  image: Image | null,
): PostWithAuthorAndBannerImageDTO {
  const mapped = {
    ...mapToPostDTO(selectedPost),
    authors: users ? users.map((user) => mapToUserDTO(user)) : [],
    bannerImage: image ? mapToImageDTO(image) : undefined,
  };

  delete mapped.bannerImageId;
  return mapped;
}
