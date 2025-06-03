import { WEBSITE_ROOT } from '../globals';

export const TopicThing = (title: string) =>
  ({
    '@type': 'Thing',
    name: title,
    description: `Articles and tutorials about ${title}`,
  }) as const;

export const TagThing = (tagName: string) =>
  ({
    '@type': 'Thing',
    name: tagName,
    url: new URL(`/topics/${tagName.toLowerCase()}`, WEBSITE_ROOT).href,
  }) as const;
