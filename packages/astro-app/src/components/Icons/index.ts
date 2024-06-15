import type { HTMLAttributes } from 'astro/types';
import type {
  AstroIconDimensions,
  AstroIconNamingProps,
  GenericIconVariantsProps,
} from './GenericIcon.astro';

export type CustomIconProps = HTMLAttributes<'svg'> &
  GenericIconVariantsProps &
  Partial<AstroIconNamingProps> &
  AstroIconDimensions;

export { GitHubIcon } from './GitHubIcon';
export { InstagramIcon } from './InstagramIcon';
export { XIcon } from './XIcon';
