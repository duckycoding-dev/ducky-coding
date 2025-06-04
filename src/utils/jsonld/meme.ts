import { WEBSITE_ROOT } from '@utils/globals';
import { AuthorPerson } from './person';
import { TagThing } from './thing';
import type { BaseHeadProps } from '../../layouts/BaseHead/BaseHead.astro';

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

export const MemeJsonLd = (props: MemeJsonLdProps) => {
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
    '@type': 'CreativeWork',
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
    about: tags.map((tag) => TagThing(tag)),
    inLanguage: 'en',
    isAccessibleForFree: true,
    usageInfo: 'Educational and entertainment purposes',
  } as const satisfies NonNullable<BaseHeadProps['jsonLd']>['item'];
};
