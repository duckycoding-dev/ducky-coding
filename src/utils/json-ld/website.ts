import type { WebSite } from 'schema-dts';

import { WEBSITE_ROOT } from '@utils/globals';
import { DuckyCodingPerson } from './person';

export const DuckyCodingWebsite: WebSite = {
  '@type': 'WebSite',
  name: 'DuckyCoding',
  url: WEBSITE_ROOT,
  description:
    'Web development blog featuring tutorials, guides, and insights about modern web technologies.',
  author: DuckyCodingPerson,
};
