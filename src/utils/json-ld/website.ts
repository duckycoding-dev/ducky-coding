import { WEBSITE_ROOT } from '@utils/globals';
import type { BaseHeadProps } from '../../layouts/base-head/BaseHead.astro';
import { DuckyCodingPerson } from './person';

export const DuckyCodingWebsite = {
  '@type': 'WebSite',
  name: 'DuckyCoding',
  url: WEBSITE_ROOT,
  description:
    'Web development blog featuring tutorials, guides, and insights about modern web technologies.',
  author: DuckyCodingPerson,
} as const satisfies Omit<
  NonNullable<BaseHeadProps['jsonLd']>['item'],
  '@context'
>;
