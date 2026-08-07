import type { CollectionPage, WebPage } from 'schema-dts';

import { websiteRef } from './graph';

interface BuildWebPageParams {
  pageUrl: string;
  name: string;
  description: string;
  datePublished?: string;
  dateModified?: string;
  primaryImageUrl?: string;
  /** When true, adds `breadcrumb: { @id: pageUrl#breadcrumb }` ref. */
  hasBreadcrumb?: boolean;
  /** Optional @id ref to the main entity this page is about. */
  mainEntityId?: string;
}

export function buildWebPage({
  pageUrl,
  name,
  description,
  datePublished,
  dateModified,
  primaryImageUrl,
  hasBreadcrumb,
  mainEntityId,
}: BuildWebPageParams): WebPage {
  return {
    '@type': 'WebPage',
    '@id': pageUrl,
    url: pageUrl,
    name,
    description,
    inLanguage: 'en',
    isPartOf: websiteRef(),
    ...(datePublished && { datePublished }),
    ...(dateModified && { dateModified }),
    ...(primaryImageUrl && {
      primaryImageOfPage: {
        '@type': 'ImageObject',
        url: primaryImageUrl,
        contentUrl: primaryImageUrl,
      },
    }),
    ...(hasBreadcrumb && {
      breadcrumb: { '@id': `${pageUrl}#breadcrumb` },
    }),
    ...(mainEntityId && {
      mainEntity: { '@id': mainEntityId },
    }),
  };
}

export function buildCollectionPage(
  params: BuildWebPageParams,
): CollectionPage {
  return {
    ...buildWebPage(params),
    '@type': 'CollectionPage',
  } as CollectionPage;
}
