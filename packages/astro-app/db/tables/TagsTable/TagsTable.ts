import { column, defineTable } from 'astro:db';
import { optional } from 'zod';

export const TagsTable = defineTable({
  columns: {
    name: column.text({ primaryKey: true, unique: true }),
  },
});
