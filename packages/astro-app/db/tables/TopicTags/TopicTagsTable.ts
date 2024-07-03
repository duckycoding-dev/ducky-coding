import { column, defineTable } from 'astro:db';

export const TopicTagsTable = defineTable({
  columns: {
    name: column.text({ primaryKey: true, unique: true }),
  },
});
