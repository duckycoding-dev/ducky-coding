import type { TopicWithImageDTO } from '@custom-types/DTOs';
import type { Topic } from './topics.model';
import type { Image } from '../images/images.model';

export function mapToTopicWithImageDTO(
  topic: Topic,
  image?: Image,
): TopicWithImageDTO {
  return {
    title: topic.title,
    slug: topic.slug,
    image: image
      ? {
          id: image.id,
          alt: image.alt ?? undefined,
          path: image.path,
        }
      : undefined,
  };
}
