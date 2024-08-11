import { PostWithAuthorAndBannerImageDTO } from '@ducky-coding/types/DTOs';
import {
  Image,
  mapToImageDTO,
  mapToPostDTO,
  mapToUserDTO,
  Post,
  User,
} from '../models';

export function mapToPostWithAuthorAndBannerImageDTO(
  selectedPost: Post,
  users: User[],
  image?: Image,
): PostWithAuthorAndBannerImageDTO {
  const mapped = {
    ...mapToPostDTO(selectedPost),
    authors: users.map((user) => mapToUserDTO(user)),
    bannerImage: image ? mapToImageDTO(image) : undefined,
  };

  delete mapped.bannerImageId;
  return mapped;
}
