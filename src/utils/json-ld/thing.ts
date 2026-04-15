import type { Thing } from 'schema-dts';

import { WEBSITE_ROOT } from '../globals';

export function TopicThing(title: string): Thing {
  return {
    '@type': 'Thing',
    name: title,
    description: `Web development articles and tutorials about ${title} on DuckyCoding.`,
    url: new URL(`/topics/${title.toLowerCase()}`, WEBSITE_ROOT).href,
  };
}
