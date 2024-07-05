import { column, defineTable } from 'astro:db';

export const TagsTable = defineTable({
  columns: {
    name: column.text({ primaryKey: true, unique: true }),
  },
});
