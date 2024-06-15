import type { HTMLAttributes } from 'astro/types';
import type {
  AstroIconDimensions,
  AstroIconBasicProps,
  GenericIconVariantsProps,
} from './GenericIcon.astro';

export type CustomIconProps = HTMLAttributes<'svg'> &
  GenericIconVariantsProps &
  Partial<AstroIconBasicProps> &
  AstroIconDimensions;

export { GitHubIcon } from './GitHubIcon';
export { InstagramIcon } from './InstagramIcon';
export { XIcon } from './XIcon';
