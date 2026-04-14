import type { Blog } from 'schema-dts';

import { WEBSITE_ROOT } from '../globals';
import { DuckyCodingPerson } from './person';

export const DuckyCodingBlog: Blog = {
  '@type': 'Blog',
  '@id': `${WEBSITE_ROOT}/blog`,
  url: `${WEBSITE_ROOT}/blog`,
  name: "DuckyCoding's Blog",
  description:
    'Articles and tutorials about web development — TypeScript, Astro, frontend architecture, and more. Written by Davide (DuckyCoding).',
  author: DuckyCodingPerson,
};
