import type { UserWithProfilePictureDTO } from '@custom-types/DTOs';
import { mapToUserDTO, type User } from './users.model';
import type { Image } from '../images/images.model';

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
