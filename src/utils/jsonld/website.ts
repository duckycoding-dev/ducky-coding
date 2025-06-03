import { WEBSITE_ROOT } from '@utils/globals';
import { DuckyCodingPerson } from './person';

export const DuckyCodingWebsite = {
  '@type': 'WebSite',
  name: 'DuckyCoding',
  url: WEBSITE_ROOT,
  potentialAction: {
    '@type': 'SearchAction',
    target: `${WEBSITE_ROOT}/search?q={search_term_string}`,
    'query-input': 'required name=search_term_string',
  },
  description:
    'Web development blog featuring tutorials, guides, and insights about modern web technologies.',
  author: DuckyCodingPerson,
} as const;
