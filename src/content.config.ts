// 1. Import utilities from `astro:content`
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { PostContentSchema } from '@custom-types/entities';

// 2. Define your collection(s)
const posts = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/posts' }),
  schema: PostContentSchema,
});

const md = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/md' }),
});

// 3. Export a single `collections` object to register your collection(s)
//    This key should match your collection directory name in "src/content"
export const collections = { posts, md };
