import type { MediaObject, WithContext } from 'schema-dts';

import { WEBSITE_ROOT } from '@utils/globals';
import { AuthorPerson } from './person';

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

export function MemeJsonLd(props: MemeJsonLdProps): WithContext<MediaObject> {
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

  return {
    '@context': 'https://schema.org',
    '@type': 'MediaObject',
    '@id': pageUrl,
    url: pageUrl,
    name: title,
    headline: title,
    description: description || `A meme titled "${title}" created by ${author}`,
    creator: AuthorPerson(author, WEBSITE_ROOT),
    author: AuthorPerson(author, WEBSITE_ROOT),
    publisher: AuthorPerson(author, WEBSITE_ROOT),
    dateCreated: createdDate,
    datePublished: createdDate,
    dateModified: createdDate,
    image: {
      '@type': 'ImageObject',
      url: imageUrl,
      description: imageAlt,
      contentUrl: imageUrl,
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': pageUrl,
      url: pageUrl,
      name: title,
      breadcrumb: {
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: WEBSITE_ROOT,
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Memes',
            item: `${WEBSITE_ROOT}/memes`,
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: title,
            item: pageUrl,
          },
        ],
      },
      description:
        description || `A meme titled "${title}" created by ${author}`,
      isPartOf: {
        '@type': 'WebSite',
        '@id': WEBSITE_ROOT,
        url: WEBSITE_ROOT,
        name: 'DuckyCoding',
      },
    },
    keywords: tags.join(', '),
    genre: 'Meme',
    inLanguage: 'en',
    isAccessibleForFree: true,
    usageInfo: 'Educational and entertainment purposes',
  };
}
