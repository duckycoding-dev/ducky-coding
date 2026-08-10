export const IMAGE_DENSITIES = [1.5, 2, 2.5, 3];

export const IMAGE_COMMON_WIDTHS = [200, 400, 600, 800, 1000];

// There is deliberately no shared `sizes` constant. `sizes` describes the box an
// image renders into, which only the component owning that layout knows. The
// previous shared value claimed `100vw` for cards a few hundred pixels wide.

export const WEBSITE_FIRST_PUBLISHING_DATE = new Date(
  2025,
  5,
  1,
  18,
).toISOString();

export const WEBSITE_ROOT = 'https://duckycoding.dev';

export const MY_SOCIALS_LINKS = {
  github: 'https://github.com/duckycoding-dev',
  x: 'https://x.com/ducky_coding',
  linkedin: 'https://www.linkedin.com/in/davide-m-997874254/',
  instagram: 'https://www.instagram.com/ducky.coding/',
  tiktok: 'https://www.tiktok.com/@ducky.coding',
  youtube: 'https://www.youtube.com/@ducky.coding',
  reddit: 'https://www.reddit.com/user/DuckyCodingDev/',
} as const;
