import { db } from './client';
import { tagsTable } from './features/tags/tags.model';
import { topicsTable } from './features/topics/topics.model';

export default async function seed() {
  // TODO
  await db
    .insert(tagsTable)
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

  await db.insert(topicsTable).values([
    {
      title: 'Astro',
      slug: 'astro',
    },
    {
      title: 'React',
      slug: 'react',
    },
  ]);
}

seed();
