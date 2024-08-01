// 1. Import utilities from `astro:content`
import { z, defineCollection } from 'astro:content';

// 2. Define your collection(s)
const postsCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    summary: z.string().optional(),
    content: z.string(),
    authors: z
      .array(
        z.object({
          name: z.string(),
          id: z.string(),
        }),
      )
      .min(1),
    topic: z.object({
      title: z.string(),
      image: z.object({
        fileName: z.string(),
        alt: z.string(),
      }),
      slug: z.string(),
    }),
    tags: z.array(z.string()).min(1),
    timeToRead: z.number(),
    createdAt: z.date(),
    publishedAt: z.date().optional(),
    updatedAt: z.date().optional(),
    bannerImage: z.object({
      filename: z.string(),
      alt: z.string(),
    }),
    isPublished: z.boolean().default(false),
    language: z.enum(['en', 'it']).default('en'),
  }),
});

// 3. Export a single `collections` object to register your collection(s)
//    This key should match your collection directory name in "src/content"
export const collections = {
  posts: postsCollection,
};
