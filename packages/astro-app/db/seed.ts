import { db, TopicsTable, TagsTable } from 'astro:db';

// https://astro.build/db/seed
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
    },
    {
      title: 'React',
      imageFilename: 'src/assets/images/topics/react-logo.png',
      imageAlt: 'React logo',
    },
  ]);
}
