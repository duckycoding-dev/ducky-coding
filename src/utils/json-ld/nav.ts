import type { ItemList } from 'schema-dts';

import { WEBSITE_ROOT } from '@utils/globals';

interface NavItem {
  name: string;
  slug: string;
  description: string;
}

const SITE_NAV_ITEMS: NavItem[] = [
  {
    name: 'Blog',
    slug: 'blog',
    description: 'Articles and tutorials about web development.',
  },
  {
    name: 'Topics',
    slug: 'topics',
    description: 'Browse posts grouped by topic.',
  },
  {
    name: 'Memes',
    slug: 'memes',
    description: 'Tech memes collected by DuckyCoding.',
  },
  {
    name: 'My projects',
    slug: 'my-projects',
    description: 'Projects built by DuckyCoding.',
  },
];

export function SiteNavigation(): ItemList {
  return {
    '@type': 'ItemList',
    '@id': `${WEBSITE_ROOT}/#nav`,
    name: 'Main navigation',
    itemListElement: SITE_NAV_ITEMS.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      url: `${WEBSITE_ROOT}/${item.slug}`,
      item: {
        '@type': 'SiteNavigationElement',
        name: item.name,
        url: `${WEBSITE_ROOT}/${item.slug}`,
        description: item.description,
      },
    })),
  };
}
