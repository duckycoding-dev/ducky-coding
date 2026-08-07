import type { Organization } from 'schema-dts';

import DuckyCodingLogo from '@assets/images/DuckyCoding_logo.png';
import { MY_SOCIALS_LINKS, WEBSITE_ROOT } from '@utils/globals';
import { ORG_ID } from './graph';

const logoUrl = new URL(DuckyCodingLogo.src, WEBSITE_ROOT).href;

export const DuckyCodingPublisher: Organization = {
  '@type': 'Organization',
  '@id': ORG_ID,
  name: 'DuckyCoding',
  url: WEBSITE_ROOT,
  logo: {
    '@type': 'ImageObject',
    url: logoUrl,
    contentUrl: logoUrl,
    width: `${DuckyCodingLogo.width}`,
    height: `${DuckyCodingLogo.height}`,
  },
  sameAs: [
    MY_SOCIALS_LINKS.x,
    MY_SOCIALS_LINKS.github,
    MY_SOCIALS_LINKS.linkedin,
    MY_SOCIALS_LINKS.youtube,
    MY_SOCIALS_LINKS.instagram,
    MY_SOCIALS_LINKS.tiktok,
  ],
};
