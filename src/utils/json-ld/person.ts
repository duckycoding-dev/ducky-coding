import type { Person } from 'schema-dts';

import headshotDavide from '@assets/images/head-shot-davide.jpg';
import { MY_SOCIALS_LINKS, WEBSITE_ROOT } from '@utils/globals';
import { PERSON_ID, personRef } from './graph';
import { WavelopOrganization } from './organization';

const headshotUrl = new URL(headshotDavide.src, WEBSITE_ROOT).href;

export const DuckyCodingPerson = {
  '@type': 'Person',
  '@id': PERSON_ID,
  url: WEBSITE_ROOT,
  name: 'Davide Milan',
  alternateName: 'DuckyCoding',
  image: {
    '@type': 'ImageObject',
    url: headshotUrl,
    contentUrl: headshotUrl,
    width: `${headshotDavide.width}`,
    height: `${headshotDavide.height}`,
    caption: 'Davide Milan (DuckyCoding) — portrait',
  },
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
    MY_SOCIALS_LINKS.x,
    MY_SOCIALS_LINKS.github,
    MY_SOCIALS_LINKS.linkedin,
    MY_SOCIALS_LINKS.youtube,
    MY_SOCIALS_LINKS.instagram,
    MY_SOCIALS_LINKS.tiktok,
  ],
} as const satisfies Person;

/**
 * Reference to the DuckyCoding Person by @id — use inside graph nodes
 * that need to point at the canonical Person without duplicating it.
 */
export const DuckyCodingPersonRef = personRef;

/**
 * Build a Person node for a guest/community author. For DuckyCoding
 * himself, prefer `DuckyCodingPersonRef()` (an @id stub) instead — this
 * function returns a fresh Person for non-canonical authors.
 *
 * `url` is optional and only emitted when provided — do not pass
 * WEBSITE_ROOT for guests, that would misattribute the guest to the
 * site's canonical URL.
 */
export function AuthorPerson(authorName: string, url?: string): Person {
  if (authorName.toLowerCase() === 'duckycoding') {
    return { '@id': PERSON_ID } as Person;
  }
  return {
    '@type': 'Person',
    name: authorName,
    ...(url && { url }),
  };
}
