import type { Thing } from 'schema-dts';

import { WEBSITE_ROOT } from '../globals';

export function TopicThing(title: string): Thing {
  return {
    '@type': 'Thing',
    name: title,
    description: `Articles and tutorials about ${title}`,
    url: new URL(`/topics/${title.toLowerCase()}`, WEBSITE_ROOT).href,
  };
}
