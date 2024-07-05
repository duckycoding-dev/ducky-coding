import { column, defineTable } from 'astro:db';
import { TagsTable } from '../TagsTable';

export const TopicsTable = defineTable({
  columns: {
    title: column.text({
      primaryKey: true,
      unique: true,
      references: () => TagsTable.columns.name,
    }),
    imageSrc: column.text(),
    imageAlt: column.text(),
  },
});
