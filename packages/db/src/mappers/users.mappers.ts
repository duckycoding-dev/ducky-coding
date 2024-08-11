import { UserWithProfilePictureDTO } from '@ducky-coding/types/DTOs';
import { Image, mapToUserDTO, User } from '../models';

export function mapToUserWithProfilePictureDTO(
  user: User,
  image: Image,
): UserWithProfilePictureDTO {
  const mapped = {
    ...mapToUserDTO(user),
    profilePicture: {
      id: image.id,
      path: image.path,
      alt: image.alt ?? undefined,
    },
  };
  delete mapped.profilePictureId;
  return mapped;
}
