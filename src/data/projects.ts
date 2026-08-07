import type { ImageMetadata } from 'astro';

import pentaNewsLogo from '@assets/images/penta_news_logo.png';
import pvverdictLogo from '@assets/images/pvverdict_logo.png';
import leetCodeLogo from '@assets/images/topics/leetcode_logo.png';
import { MY_SOCIALS_LINKS, WEBSITE_ROOT } from '@utils/globals';

export interface ProjectLink {
  label: string;
  href: string;
}

export interface Project {
  title: string;
  /** Canonical summary, kept in sync with the GitHub profile copy. */
  summary: string;
  /** Shorter, homepage-specific variant used by the Selected projects block. */
  homeSummary?: string;
  technologies: string[];
  projectUrl: string;
  linkActionTitle: string;
  bannerImage?: ImageMetadata;
  bannerImageClass?: string;
  imageAlt?: string;
  /** Extra links rendered outside the card, where the layout allows it. */
  secondaryLinks?: ProjectLink[];
}

/**
 * Main projects, in the order they must be presented:
 * PVVerdict, DuckyCoding, Task Manager.
 */
export const MAIN_PROJECTS: Project[] = [
  {
    title: 'PVVerdict',
    bannerImage: pvverdictLogo,
    imageAlt: 'PVVerdict logo',
    // full logo, not a cropped banner: contain it over a neutral background
    bannerImageClass: 'bg-none bg-white [&_img]:object-contain [&_img]:p-3',
    summary:
      'A local-first web application that estimates solar PV production, self-consumption, savings and payback time using hourly PVGIS data. It compares systems with and without battery storage while keeping consumption data in the browser.',
    homeSummary:
      'A local-first React application that estimates solar PV production, self-consumption, savings and payback using hourly PVGIS data. It compares systems with and without battery storage while keeping consumption data in the browser.',
    technologies: [
      'React',
      'TypeScript',
      'Recharts',
      'Bun',
      'Cloudflare Pages',
      'Astro',
    ],
    projectUrl: 'https://pvverdict-landing.pages.dev/',
    linkActionTitle: 'Discover PVVerdict',
    secondaryLinks: [
      {
        label: 'Source code',
        href: `${MY_SOCIALS_LINKS.github}/pvverdict`,
      },
    ],
  },
  {
    title: 'DuckyCoding (this website)',
    summary:
      'My developer blog and portfolio, built to publish web-development articles, experiments and memes through a maintainable content workflow.',
    homeSummary:
      'This website is also one of my main projects: an Astro and TypeScript blog designed for fast navigation, responsive content and maintainable publishing workflows.',
    technologies: [
      'Astro',
      'TypeScript',
      'Tailwind CSS',
      'MDX',
      'Netlify',
      'libSQL',
    ],
    projectUrl: WEBSITE_ROOT,
    linkActionTitle: 'Live Site',
    secondaryLinks: [
      {
        label: 'Source code',
        href: `${MY_SOCIALS_LINKS.github}/ducky-coding`,
      },
    ],
  },
  {
    title: 'Task Manager',
    summary:
      'An incremental frontend laboratory built around a reusable task-management backend. The backend is complete, while frontend implementations are developed progressively to explore different patterns, libraries and design approaches.',
    technologies: [
      'Hono',
      'TypeScript',
      'Drizzle ORM',
      'PostgreSQL',
      'Zod',
      'React',
    ],
    projectUrl: `${MY_SOCIALS_LINKS.github}/task_manager`,
    linkActionTitle: 'GitHub',
  },
];

/** Earlier projects and experiments, kept as a secondary section. */
export const PAST_PROJECTS: Project[] = [
  {
    title: 'LeetCode solutions',
    bannerImage: leetCodeLogo,
    imageAlt: "LeetCode's platform logo",
    summary:
      "My repository of LeetCode problems solutions that I've written, showcasing problem-solving skills and algorithmic thinking.",
    technologies: ['Algorithms', 'Data Structures', 'JavaScript', 'Python'],
    projectUrl: `${MY_SOCIALS_LINKS.github}/neecode-leetcode-roadmap-exercises`,
    linkActionTitle: 'GitHub',
    bannerImageClass: 'from-danger to-accent2 bg-gradient-to-tl',
  },
  {
    title: 'CLI Templater',
    summary:
      'Customizable and interactive CLI tool that aids in setting up repetitive files with a common structure.',
    technologies: ['CLI', 'CommanderJS', 'inquirer', 'TypeScript', 'Bun'],
    projectUrl: `${MY_SOCIALS_LINKS.github}/cli-templater`,
    linkActionTitle: 'GitHub',
  },
  {
    title: 'PentaNews',
    bannerImage: pentaNewsLogo,
    imageAlt: 'PentaNews logo',
    summary:
      "My first ever web development project, done for my web development course at Padua's university with three friends. It's an online journalism platform that allows users to read and comment on news articles, and admins to create such articles. It's built with PHP, bare minimum vanilla JavaScript, tons of CSS, MySQL and great emphasis on responsive design and accessibility. (unfortunately, the website is no longer online, but the code is still available on my friend's GitHub repo)",
    technologies: ['PHP', 'JavaScript', 'CSS', 'MySQL'],
    projectUrl: 'https://github.com/0xCaso/penta-news',
    linkActionTitle: 'GitHub',
  },
  {
    title: 'Chartpp',
    summary:
      "My first solo project, done for my OOP course at Padua's university. It's a GUI application built with Qt that allows you to create and edit charts, export them as CSV and JSON, with a focus on object-oriented programming principles.",
    technologies: ['C++', 'OOP', 'Qt', 'JSON'],
    projectUrl: 'https://github.com/Davide-Milan/Chartpp',
    linkActionTitle: 'GitHub',
  },
];

/** Every project, main ones first: used for structured data and listings. */
export const ALL_PROJECTS: Project[] = [...MAIN_PROJECTS, ...PAST_PROJECTS];

/** Main projects featured on the homepage, with their homepage copy. */
export const SELECTED_PROJECTS: Project[] = MAIN_PROJECTS.filter(
  (project) => project.homeSummary !== undefined,
);
