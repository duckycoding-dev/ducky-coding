import type { PostWithAuthorAndBannerImageDTO } from '@custom-types/DTOs';
import { type Image, mapToImageDTO } from '../images/images.model';
import { type User, mapToUserDTO } from '../users/users.model';
import { type Post, mapToPostDTO } from './posts.model';

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
