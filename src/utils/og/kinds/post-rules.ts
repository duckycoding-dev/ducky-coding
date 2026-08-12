import type { CardChip } from '../card-shell.ts';

const MAX_TAG_LENGTH = 18;

/**
 * The topic, then the first tag that is not the topic.
 *
 * Every post in the repo has `tags[0] === topicTitle`, so pairing the topic with
 * `tags[0]` would print the same word twice on every card.
 *
 * Kept free of Astro imports so it can be unit-tested without the content layer.
 */
export function pickChips(topicTitle: string, tags: string[]): CardChip[] {
  const chips: CardChip[] = [{ label: topicTitle, tone: 'accent' }];

  const extra = tags.find(
    (tag) =>
      tag.trim().length > 0 &&
      tag.trim().toLowerCase() !== topicTitle.trim().toLowerCase(),
  );
  if (extra !== undefined) {
    chips.push({ label: truncateTag(extra.trim()), tone: 'accent2' });
  }

  return chips;
}

function truncateTag(tag: string): string {
  if (tag.length <= MAX_TAG_LENGTH) return tag;
  return `${tag.slice(0, MAX_TAG_LENGTH - 1)}…`;
}
