export interface WhatIDoItem {
  /** Iconify name, verified present in @iconify-json/mdi. */
  icon: string;
  /** Tooltip text for the icon. Not an accessible name — the icon is decorative. */
  iconTitle: string;
  heading: string;
  body: string;
  /** Tailwind background class for the card surface. */
  surfaceClass: string;
  /** True for the card that spans both grid columns. */
  isWide: boolean;
}

export const WHAT_I_DO: WhatIDoItem[] = [
  {
    icon: 'mdi:code-braces',
    iconTitle: 'Code',
    heading: 'Frontend Engineering',
    body: 'I build responsive interfaces and reusable components with React and TypeScript, focusing on clear responsibilities, maintainable structure and a consistent user experience.',
    surfaceClass: 'bg-accent-100',
    isWide: true,
  },
  {
    icon: 'mdi:server',
    iconTitle: 'Server',
    heading: 'End-to-end Development',
    body: 'My full-stack experience helps me follow features beyond the interface, from API integration to Node.js business logic and serverless services with AWS Lambda.',
    surfaceClass: 'bg-accent2-100',
    isWide: false,
  },
  {
    icon: 'mdi:pencil-ruler',
    iconTitle: 'Pencil and ruler',
    heading: 'Projects and Writing',
    body: 'I use personal projects to explore product ideas, frontend architecture and modern web tooling, then share useful lessons through DuckyCoding.',
    surfaceClass: 'bg-accent3-100',
    isWide: false,
  },
];
