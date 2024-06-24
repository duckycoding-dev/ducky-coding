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
