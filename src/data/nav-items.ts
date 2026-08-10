export interface NavItem {
  href: string;
  /** Display text. Deliberately decoupled from the slug. */
  label: string;
}

/**
 * The header's content destinations.
 *
 * Search is deliberately absent: it is an action, served by
 * `NavSearchForm`, not a content section. Rendering it as a sixth
 * equal-weight link was a category error.
 */
export const NAV_ITEMS: NavItem[] = [
  { href: '/', label: 'Home' },
  { href: '/blog', label: 'Blog' },
  { href: '/topics', label: 'Topics' },
  { href: '/memes', label: 'Memes' },
  // The slug stays /my-projects; only the label shortens.
  { href: '/my-projects', label: 'Projects' },
];
