const FRONTEND_TECHNOLOGIES = [
  'React',
  'TypeScript',
  'Astro',
  'Next.js',
  'Tailwind CSS',
  'Styled Components',
  'Material UI',
  'Redux',
  'HTML',
  'Modern CSS',
];

const BACKEND_TECHNOLOGIES = [
  'Node.js',
  'Hono',
  'REST APIs',
  'AWS Lambda',
  'SQL',
  'Drizzle ORM',
  'Zod',
];

const TOOLS = [
  'Git',
  'Bun',
  'Vite',
  'Jest',
  'Docker',
  'ESLint',
  'Prettier',
  'VSCode',
];

export interface TechnologyGroup {
  /** Iconify name, verified present in @iconify-json/mdi. */
  icon: string;
  /** Tooltip text for the icon. Not an accessible name — the icon is decorative. */
  iconTitle: string;
  heading: string;
  body: string;
  /** Tailwind background class for the card surface. */
  surfaceClass: string;
}

/**
 * Deliberately unnumbered: these four groups have no inherent order, so the
 * `FeatureCard` numeral is omitted. Icons also avoid `code-braces` and `server`,
 * which the homepage's "What I do" cards already use.
 */
export const TECHNOLOGIES: TechnologyGroup[] = [
  {
    icon: 'mdi:monitor-dashboard',
    iconTitle: 'Monitor',
    heading: 'Frontend',
    body: `${FRONTEND_TECHNOLOGIES.join(', ')} and more...`,
    surfaceClass: 'bg-accent-100',
  },
  {
    icon: 'mdi:api',
    iconTitle: 'API',
    heading: 'Backend',
    body: `${BACKEND_TECHNOLOGIES.join(', ')} and more...`,
    surfaceClass: 'bg-accent2-100',
  },
  {
    icon: 'mdi:code-tags',
    iconTitle: 'Code tags',
    heading: 'Programming languages',
    body: 'Modern JS, TypeScript, OOP with C++ and a sprinkle of PHP',
    surfaceClass: 'bg-accent3-100',
  },
  {
    icon: 'mdi:wrench',
    iconTitle: 'Wrench',
    heading: 'Tools',
    body: `${TOOLS.join(', ')} and more...`,
    surfaceClass: 'bg-primary-100',
  },
];
