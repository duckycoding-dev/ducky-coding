import { TopicWithImageDTO } from '@ducky-coding/types/DTOs';
import { Image, Topic } from '../models';

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
