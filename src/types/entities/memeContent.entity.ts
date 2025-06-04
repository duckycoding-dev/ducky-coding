import { z } from 'astro:content';

export const MemeContentSchema = z.object({
  title: z.string().min(1),
  author: z.string().min(1), // Author of the meme
  imagePath: z.string(), // Path to the image file in src/assets/images (ex: 'memes/my-meme.jpg')
  imageAlt: z.string().min(1), // Alt text for the image
  createdAt: z.number().default(Date.now), // Unix timestamp
  tags: z.array(z.string()).optional(),
  externalLinks: z
    .object({
      socials: z
        .object({
          x: z.string().url().optional(), // Link to the meme on X (formerly Twitter)
          linkedin: z.string().url().optional(), // Link to the meme on LinkedIn
          reddit: z.string().url().optional(), // Link to the meme on Reddit
          instagram: z.string().url().optional(), // Link to the meme on Instagram
          github: z.string().url().optional(), // Link to the meme on GitHub
          tiktok: z.string().url().optional(), // Link to the meme on TikTok
          youtube: z.string().url().optional(), // Link to the meme on YouTube
        })
        .optional(),
      source: z.string().url().optional(), // Link to the original source of the meme
      author: z.string().url().optional(), // Author of the meme if different from the main author
    })
    .optional(),
});

export type MemeContent = z.infer<typeof MemeContentSchema>;
