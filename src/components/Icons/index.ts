import type { HTMLAttributes } from 'astro/types';

import type {
  AstroIconBasicProps,
  AstroIconDimensions,
  GenericIconVariantsProps,
} from './GenericIcon.astro';

export type CustomIconProps = HTMLAttributes<'svg'> &
  GenericIconVariantsProps &
  Partial<AstroIconBasicProps> &
  AstroIconDimensions;
