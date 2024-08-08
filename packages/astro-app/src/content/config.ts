// 1. Import utilities from `astro:content`
import { defineCollection } from 'astro:content';
import { PostContentSchema } from '@ducky-coding/types/entities';

// 2. Define your collection(s)
const postsCollection = defineCollection({
  type: 'content',
  schema: PostContentSchema,
});

// 3. Export a single `collections` object to register your collection(s)
//    This key should match your collection directory name in "src/content"
export const collections = {
  posts: postsCollection,
};
