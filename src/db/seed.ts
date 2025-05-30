import { serverLogger } from '@utils/logs/logger';
import { db } from './client';
import { imagesTable } from './features/images/images.model';
import { postsTable } from './features/posts/posts.model';
import { postsTagsTable } from './features/posts/posts_tags.model';
import { tagsTable } from './features/tags/tags.model';
import { topicsTable } from './features/topics/topics.model';
import reactJSON from '../content/topics/react.json';
import cssJSON from '../content/topics/css.json';
import typescriptJSON from '../content/topics/typescript.json';
import astroJSON from '../content/topics/astro.json';
import leetcodeJSON from '../content/topics/leetcode.json';

export default async function seed() {
  // TODO
  await db.insert(imagesTable).values([
    { path: 'topics/astro-icon-light-gradient.png', alt: 'Logo of AstroJS' },
    {
      path: 'default_profile_icon.png',
      alt: 'Default profile icon for every new user',
    },
    { path: 'topics/css3_logo.png', alt: 'Logo of the third version of CSS' },
    { path: 'topics/typescript_logo.png', alt: 'Logo of TypeScript' },
    { path: 'topics/react_logo.png', alt: 'Logo of ReactJS' },
    { path: 'posts/test-banner.png', alt: 'Test image for a post' },
    { path: 'DuckyCoding_logo.png', alt: 'Official logo of DuckyCoding' },
  ]);
  await db
    .insert(tagsTable)
    .values([
      { name: 'Astro' },
      { name: 'CSS' },
      { name: 'TypeScript' },
      { name: 'React' },
    ]);

  await db
    .insert(topicsTable)
    .values([reactJSON, cssJSON, typescriptJSON, astroJSON, leetcodeJSON]);

  await db.insert(postsTable).values([
    {
      id: 1,
      slug: 'post-1',
      title: 'post1 title',
      summary: 'summary post1',
      content: 'content title post1',
      topicTitle: 'Astro',
      language: 'en',
      timeToRead: 3,
      status: 'published',
      createdAt: 1723499812,
      updatedAt: 1748190999,
      publishedAt: 1723499812,
      deletedAt: null,
      author: 'DuckyCoding',
      bannerImagePath: 'posts/test-banner.png',
    },
  ]);

  await db.insert(postsTagsTable).values([
    {
      postId: 1,
      tagName: 'Astro',
    },
  ]);

  serverLogger.info('✅ Database seeded successfully');
}

seed();
