import { WEBSITE_ROOT } from '../globals';

export interface TopicThingNode {
  '@type': 'Thing';
  '@id': string;
  name: string;
  description: string;
  url: string;
}

export function TopicThing({
  title,
  slug,
}: {
  title: string;
  slug: string;
}): TopicThingNode {
  const topicUrl = new URL(`/topics/${slug}`, WEBSITE_ROOT).href;
  return {
    '@type': 'Thing',
    '@id': `${topicUrl}#topic`,
    name: title,
    description: `Web development articles and tutorials about ${title} on DuckyCoding.`,
    url: topicUrl,
  };
}
