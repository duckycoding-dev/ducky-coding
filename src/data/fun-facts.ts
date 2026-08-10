export interface FunFact {
  /** Iconify name, verified present in @iconify-json/mdi. */
  icon: string;
  /** Tooltip text for the icon. Not an accessible name — the icon is decorative. */
  iconTitle: string;
  title: string;
  description: string;
  /** Tailwind background class for the sticker surface. */
  surfaceClass: string;
}

export const FUN_FACTS: FunFact[] = [
  {
    // `chili-hot` rather than the more obvious `sprout`: it matches the copy
    // precisely, and it avoids a second plant mark alongside the timeline's
    // `seed`.
    icon: 'mdi:chili-hot',
    iconTitle: 'Chili pepper',
    title: 'Gardener',
    description: 'Hot peppers enjoyer',
    surfaceClass: 'bg-accent-100',
  },
  {
    icon: 'mdi:gamepad-variant',
    iconTitle: 'Gamepad',
    title: 'Gamer',
    description: 'Since I was a little kid',
    surfaceClass: 'bg-accent2-100',
  },
  {
    icon: 'mdi:book-open-page-variant',
    iconTitle: 'Open book',
    title: 'Learner',
    description: 'Always exploring new tech',
    surfaceClass: 'bg-accent3-100',
  },
  {
    icon: 'mdi:duck',
    iconTitle: 'Duck',
    title: 'Duck lover',
    description: 'Quack quack quack',
    surfaceClass: 'bg-primary-100',
  },
];
