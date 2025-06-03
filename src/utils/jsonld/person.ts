import { WEBSITE_ROOT } from '@utils/globals';
import headshotDavide from '@assets/images/head-shot-davide.jpg';
import { WavelopOrganization } from './organization';

export const DuckyCodingPerson = {
  '@type': 'Person',
  '@id': WEBSITE_ROOT,
  url: WEBSITE_ROOT,
  name: 'Davide Milan',
  alternateName: 'DuckyCoding',
  image: new URL(headshotDavide.src, WEBSITE_ROOT).href,
  description:
    "I'm Davide, aka DuckyCoding, a passionate web developer who loves crafting modern digital experiences, sharing what I learn along my path with everyone online.",
  jobTitle: 'Fullstack Web Developer',
  worksFor: WavelopOrganization,
  alumniOf: {
    '@type': 'CollegeOrUniversity',
    name: 'University of Padua',
    url: 'https://informatica.math.unipd.it/en/bachelor/',
  },
  knowsAbout: [
    'Web Development',
    'JavaScript',
    'TypeScript',
    'React',
    'Node.js',
    'Frontend Development',
    'Backend Development',
    'Full Stack Development',
  ],
  sameAs: [
    'https://x.com/ducky_coding',
    'https://github.com/duckycoding-dev',
    'https://www.linkedin.com/in/davide-m-997874254/',
    'https://www.youtube.com/@ducky.coding',
    'https://www.instagram.com/ducky.coding/',
    'https://www.tiktok.com/@ducky.coding',
  ],
} as const;

export const AuthorPerson = (authorName: string, url: string) =>
  ({
    '@type': 'Person',
    name: authorName,
    url: url,
    ...(authorName.toLowerCase() === 'duckycoding' && {
      sameAs: [
        'https://x.com/ducky_coding',
        'https://github.com/duckycoding-dev',
        'https://www.linkedin.com/in/davide-m-997874254/',
      ],
    }),
  }) as const;
