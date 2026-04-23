import type { Blog } from 'schema-dts';

import { WEBSITE_ROOT } from '../globals';
import { BLOG_ID, orgRef, personRef, websiteRef } from './graph';

export const DuckyCodingBlog: Blog = {
  '@type': 'Blog',
  '@id': BLOG_ID,
  url: `${WEBSITE_ROOT}/blog`,
  name: "DuckyCoding's Blog",
  description:
    'Articles and tutorials about web development — TypeScript, Astro, frontend architecture, and more. Written by Davide (DuckyCoding).',
  inLanguage: 'en',
  author: personRef(),
  publisher: orgRef(),
  isPartOf: websiteRef(),
};
