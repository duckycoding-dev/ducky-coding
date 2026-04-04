import { WEBSITE_ROOT } from '../globals';

export const TopicThing = (title: string) =>
  ({
    '@type': 'Thing',
    name: title,
    description: `Articles and tutorials about ${title}`,
    url: new URL(`/topics/${title.toLowerCase()}`, WEBSITE_ROOT).href,
  }) as const;
