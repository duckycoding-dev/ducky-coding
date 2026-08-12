import { formatReadTime } from '@utils/read-time/read-time';

const MAX_VISIBLE_TAGS = 2;

const publicationDateFormatter = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  timeZone: 'UTC',
});

interface PostCardPresentationInput {
  publishedAt: number | null;
  createdAt: number;
  timeToRead: number;
  tags: string[];
  author: string;
}

export const getPostCardPresentation = ({
  publishedAt,
  createdAt,
  timeToRead,
  tags,
  author,
}: PostCardPresentationInput) => {
  const publicationDate = new Date(publishedAt ?? createdAt);
  const visibleTags = tags.slice(0, MAX_VISIBLE_TAGS);
  const hiddenTags = tags.slice(MAX_VISIBLE_TAGS);
  const hiddenTagCount = hiddenTags.length;

  return {
    publicationDate,
    publicationDateLabel: publicationDateFormatter.format(publicationDate),
    readTimeLabel: formatReadTime(timeToRead, 'long'),
    visibleTags,
    hiddenTags,
    hiddenTagCount,
    hiddenTagsLabel:
      hiddenTagCount > 0
        ? `${hiddenTagCount} more ${hiddenTagCount === 1 ? 'tag' : 'tags'}: ${hiddenTags.join(', ')}`
        : null,
    authorLabel:
      author.toLocaleLowerCase('en-US') === 'duckycoding'
        ? null
        : `By ${author}`,
  };
};
