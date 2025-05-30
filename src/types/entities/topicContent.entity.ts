import { z } from 'astro:content';

export const TopicContentSchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1),
  imagePath: z.string().optional(),
  description: z.string().min(1),
  backgroundGradient: z.string().optional(), // tailwind gradient classes
  externalLink: z.string().optional(),
});

export type TopicContent = z.infer<typeof TopicContentSchema>;
