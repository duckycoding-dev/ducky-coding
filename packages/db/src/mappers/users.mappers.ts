import { UserWithProfilePictureDTO } from '@ducky-coding/types/DTOs';
import { Image, mapToUserDTO, User } from '../models';

export function mapToUserWithProfilePictureDTO(
  user: User,
  image: Image | null,
): UserWithProfilePictureDTO {
  const mapped = {
    ...mapToUserDTO(user),
    profilePicture: image
      ? {
          id: image.id,
          path: image.path,
          alt: image.alt ?? undefined,
        }
      : undefined,
  };
  delete mapped.profilePictureId;
  return mapped;
}
