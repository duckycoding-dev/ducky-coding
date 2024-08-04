import { db } from './client';
import { TagsTable, TopicsTable } from './models';

export default async function seed() {
  // TODO
  await db
    .insert(TagsTable)
    .values([
      { name: 'Astro' },
      { name: 'React' },
      { name: 'Frontend' },
      { name: 'Backend' },
      { name: 'Web dev' },
      { name: 'Framework' },
      { name: 'API' },
      { name: 'SQL' },
    ]);

  await db.insert(TopicsTable).values([
    {
      title: 'Astro',
      imageFilename: 'src/assets/images/topics/astro-icon-light-gradient.png',
      imageAlt: 'Astro logo',
      slug: 'astro',
    },
    {
      title: 'React',
      imageFilename: 'src/assets/images/topics/react-logo.png',
      imageAlt: 'React logo',
      slug: 'react',
    },
  ]);
}

seed();
