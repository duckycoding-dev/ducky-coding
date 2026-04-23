import type { Graph, MediaObject, WebPage } from 'schema-dts';

import { WEBSITE_ROOT } from '@utils/globals';
import { buildBreadcrumb } from './breadcrumb';
import { buildGraph, orgRef, websiteRef } from './graph';
import { AuthorPerson, DuckyCodingPerson } from './person';
import { DuckyCodingPublisher } from './publisher';
import { DuckyCodingWebsite } from './website';

export interface MemeJsonLdProps {
  title: string;
  author: string;
  imageUrl: string;
  imageAlt: string;
  createdAt: number;
  tags?: string[];
  description?: string;
  pageUrl: string;
}

export function MemeJsonLd(props: MemeJsonLdProps): Graph {
  const {
    title,
    author,
    imageUrl,
    imageAlt,
    createdAt,
    tags = [],
    description,
    pageUrl,
  } = props;

  const createdDate = new Date(createdAt).toISOString();
  const finalDescription =
    description || `A meme titled "${title}" created by ${author}`;
  const creator = AuthorPerson(author, WEBSITE_ROOT);

  const mediaObject: MediaObject = {
    '@type': 'MediaObject',
    '@id': `${pageUrl}#meme`,
    url: pageUrl,
    name: title,
    headline: title,
    description: finalDescription,
    creator,
    author: creator,
    publisher: orgRef(),
    dateCreated: createdDate,
    datePublished: createdDate,
    dateModified: createdDate,
    image: {
      '@type': 'ImageObject',
      url: imageUrl,
      contentUrl: imageUrl,
      description: imageAlt,
    },
    mainEntityOfPage: { '@id': pageUrl },
    keywords: tags.join(', '),
    genre: 'Meme',
    inLanguage: 'en',
    isAccessibleForFree: true,
    usageInfo: 'Educational and entertainment purposes',
  };

  const webPage: WebPage = {
    '@type': 'WebPage',
    '@id': pageUrl,
    url: pageUrl,
    name: title,
    description: finalDescription,
    inLanguage: 'en',
    isPartOf: websiteRef(),
    primaryImageOfPage: {
      '@type': 'ImageObject',
      url: imageUrl,
    },
    breadcrumb: { '@id': `${pageUrl}#breadcrumb` },
  };

  const breadcrumb = buildBreadcrumb(
    [
      { name: 'Memes', url: `${WEBSITE_ROOT}/memes` },
      { name: title, url: pageUrl },
    ],
    pageUrl,
  );

  return buildGraph([
    DuckyCodingWebsite,
    DuckyCodingPerson,
    DuckyCodingPublisher,
    webPage,
    mediaObject,
    breadcrumb,
  ]);
}
