import type { Blog } from 'schema-dts';

import { WEBSITE_ROOT } from '../globals';
import { DuckyCodingPerson } from './person';

export const DuckyCodingBlog: Blog = {
  '@type': 'Blog',
  '@id': `${WEBSITE_ROOT}/blog`,
  url: `${WEBSITE_ROOT}/blog`,
  name: "DuckyCoding's Blog",
  description:
    'Web development blog featuring tutorials, guides, and insights about modern web technologies.',
  author: DuckyCodingPerson,
};
