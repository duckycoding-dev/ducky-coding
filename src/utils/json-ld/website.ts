import type { SearchAction, WebSite } from 'schema-dts';

import { WEBSITE_ROOT } from '@utils/globals';
import { DuckyCodingPerson } from './person';

// schema-dts lacks query-input — Google requires it for sitelinks searchbox
type SearchActionWithQueryInput = SearchAction & {
  'query-input': string;
};

export const DuckyCodingWebsite: WebSite = {
  '@type': 'WebSite',
  name: 'DuckyCoding',
  url: WEBSITE_ROOT,
  description:
    'DuckyCoding — a web development blog by Davide Milan. Tutorials, guides, and developer humor about modern web technologies.',
  author: DuckyCodingPerson,
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: `${WEBSITE_ROOT}/search?q={search_term_string}`,
    },
    'query-input': 'required name=search_term_string',
  } as SearchActionWithQueryInput,
};
