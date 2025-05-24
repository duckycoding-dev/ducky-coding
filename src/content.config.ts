// 1. Import utilities from `astro:content`
import { z, defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { PostContentSchema } from '@custom-types/entities';

export type PostContent = z.infer<typeof PostContentSchema>;

// 2. Define your collection(s)
const postsCollection = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/posts' }),
  schema: PostContentSchema,
});

const testCollection = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/md' }),
});

// 3. Export a single `collections` object to register your collection(s)
//    This key should match your collection directory name in "src/content"
export const collections = { posts: postsCollection, md: testCollection };
