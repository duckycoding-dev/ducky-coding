import type { Graph, Thing } from 'schema-dts';

import { WEBSITE_ROOT } from '@utils/globals';

export const WEBSITE_ID = `${WEBSITE_ROOT}/#website`;
export const PERSON_ID = `${WEBSITE_ROOT}/#person`;
export const ORG_ID = `${WEBSITE_ROOT}/#organization`;
export const BLOG_ID = `${WEBSITE_ROOT}/blog#blog`;

export const websiteRef = (): { '@id': string } => ({ '@id': WEBSITE_ID });
export const personRef = (): { '@id': string } => ({ '@id': PERSON_ID });
export const orgRef = (): { '@id': string } => ({ '@id': ORG_ID });
export const blogRef = (): { '@id': string } => ({ '@id': BLOG_ID });

export function buildGraph(nodes: readonly Thing[]): Graph {
  return {
    '@context': 'https://schema.org',
    '@graph': nodes,
  };
}
