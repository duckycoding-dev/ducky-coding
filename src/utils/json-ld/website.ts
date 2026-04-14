import type { WebSite } from 'schema-dts';

import { WEBSITE_ROOT } from '@utils/globals';
import { DuckyCodingPerson } from './person';

export const DuckyCodingWebsite: WebSite = {
  '@type': 'WebSite',
  name: 'DuckyCoding',
  url: WEBSITE_ROOT,
  description:
    'DuckyCoding — a web development blog by Davide Milan. Tutorials, guides, and developer humor about modern web technologies.',
  author: DuckyCodingPerson,
};
