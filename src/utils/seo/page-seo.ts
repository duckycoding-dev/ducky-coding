import type { SEOProps } from 'astro-seo';

import DuckyCodingLogo from '@assets/images/DuckyCoding_logo.png';
import { WEBSITE_ROOT } from '@utils/globals';

interface PageImage {
  src: string;
  width: number;
  height: number;
  format: string;
  alt: string;
}

interface PageArticle {
  publishedTime: string;
  modifiedTime: string;
  section: string;
  authors: string[];
  tags: string[];
}

interface PageSeoParams {
  title: string;
  description: string;
  pageUrl: string;
  keywords: string;
  ogTitle?: string;
  ogType?: 'website' | 'article';
  image?: PageImage;
  article?: PageArticle;
}

export function buildPageSeo(params: PageSeoParams): SEOProps {
  const imageUrl = params.image
    ? new URL(params.image.src, WEBSITE_ROOT).href
    : new URL(DuckyCodingLogo.src, WEBSITE_ROOT).href;

  const ogTitle = params.ogTitle ?? params.title;

  return {
    title: params.title,
    description: params.description,
    openGraph: {
      basic: {
        title: ogTitle,
        type: params.ogType ?? 'website',
        url: params.pageUrl,
        image: imageUrl,
      },
      optional: {
        description: params.description,
      },
      ...(params.image && {
        image: {
          url: imageUrl,
          secureUrl: imageUrl,
          height: params.image.height,
          width: params.image.width,
          type: `image/${params.image.format}`,
          alt: params.image.alt,
        },
      }),
      ...(params.article && { article: params.article }),
    },
    twitter: {
      title: ogTitle,
      description: params.description,
      image: imageUrl,
      ...(params.image && { imageAlt: params.image.alt }),
    },
    extend: {
      meta: [{ name: 'keywords', content: params.keywords }],
    },
  };
}
