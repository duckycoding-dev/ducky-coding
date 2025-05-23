// 1. Import utilities from `astro:content`
import { defineCollection } from 'astro:content';
import { PostContentSchema } from '@ducky-coding/types/entities';
import { glob } from 'astro/loaders';

export type PostContent = z.infer<typeof PostContentSchema>;

// 2. Define your collection(s)
const postsCollection = defineCollection({
  loader: glob({ pattern: '**/[^_]*.{md,mdx}', base: './src/content/posts' }),
  schema: PostContentSchema,
});

const testCollection = defineCollection({
  loader: glob({ pattern: '**/[^_]*.{md,mdx}', base: './src/content/md' }),
  schema: undefined,
});

// 3. Export a single `collections` object to register your collection(s)
//    This key should match your collection directory name in "src/content"
export const collections = { posts: postsCollection, md: testCollection };
