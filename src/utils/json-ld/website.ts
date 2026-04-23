import type { SearchAction, WebSite } from 'schema-dts';

import { WEBSITE_ROOT } from '@utils/globals';
import { orgRef, personRef, WEBSITE_ID } from './graph';

// schema-dts lacks query-input — Google requires it for sitelinks searchbox
type SearchActionWithQueryInput = SearchAction & {
  'query-input': string;
};

export const DuckyCodingWebsite: WebSite = {
  '@type': 'WebSite',
  '@id': WEBSITE_ID,
  name: 'DuckyCoding',
  alternateName: 'DuckyCoding - web development blog',
  url: WEBSITE_ROOT,
  inLanguage: 'en',
  description:
    'DuckyCoding — a web development blog by Davide Milan. Tutorials, guides, and developer humor about modern web technologies.',
  author: personRef(),
  publisher: orgRef(),
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: `${WEBSITE_ROOT}/search?q={search_term_string}`,
    },
    'query-input': 'required name=search_term_string',
  } as SearchActionWithQueryInput,
};
