import type { BreadcrumbList } from 'schema-dts';

import { WEBSITE_ROOT } from '@utils/globals';

interface BreadcrumbItem {
  name: string;
  url: string;
}

export function buildBreadcrumb(items: BreadcrumbItem[]): BreadcrumbList {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: WEBSITE_ROOT },
      ...items.map((item, index) => ({
        '@type': 'ListItem' as const,
        position: index + 2,
        name: item.name,
        item: item.url,
      })),
    ],
  };
}
