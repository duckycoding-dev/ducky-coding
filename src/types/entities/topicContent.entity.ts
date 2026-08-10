import { z } from 'astro/zod';

import { HEX_COLOR_PATTERN } from '@utils/topic-accent/topic-accent';

export const TopicContentSchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1),
  imagePath: z.string().optional(),
  description: z.string().min(1),
  /**
   * Six-digit hex taken from the topic's own brand colour. The hero and the
   * topic card derive their surfaces from it via `color-mix()`.
   */
  accentColor: z.string().regex(HEX_COLOR_PATTERN).optional(),
  externalLink: z.string().optional(),
});

export type TopicContent = z.infer<typeof TopicContentSchema>;
