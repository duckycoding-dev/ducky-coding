import { db } from './client';
import { imagesTable } from './features/images/images.model';
import { postsTable } from './features/posts/posts.model';
import { postsTagsTable } from './features/posts/posts_tags.model';
import { tagsTable } from './features/tags/tags.model';
import { topicsTable } from './features/topics/topics.model';

export default async function seed() {
  // TODO
  await db.insert(imagesTable).values([
    { path: 'topics/astro-icon-light-gradient.png', alt: 'Logo of AstroJS' },
    {
      path: 'default_profile_icon.png',
      alt: 'Default profile icon for every new user',
    },
    { path: 'topics/css3-logo.png', alt: 'Logo of the third version of CSS' },
    { path: 'topics/typescript-logo.png', alt: 'Logo of TypeScript' },
    { path: 'topics/react-logo.png', alt: 'Logo of ReactJS' },
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

  await db.insert(topicsTable).values([
    {
      title: 'Astro',
      slug: 'astro',
      imagePath: 'topics/astro-icon-light-gradient.png',
    },
    {
      title: 'React',
      slug: 'react',
      imagePath: 'topics/react-logo.png',
    },
    {
      title: 'CSS',
      slug: 'css',
      imagePath: 'topics/css3-logo.png',
    },
    {
      title: 'TypeScript',
      slug: 'typescript',
      imagePath: 'topics/typescript-logo.png',
    },
  ]);

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

  console.log('✅ Database seeded successfully');
}

seed();
