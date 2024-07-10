import { column, defineTable } from 'astro:db';
import { TagsTable } from '../TagsTable';

export const TopicsTable = defineTable({
  columns: {
    title: column.text({
      primaryKey: true,
      unique: true,
      optional: false,
    }),
    imageSrc: column.text(),
    imageAlt: column.text(),
  },
  foreignKeys: {
    columns: ['title']
    references: () => TagsTable.columns.name,
  }
});
