import { column, defineTable } from 'astro:db';

export const ExampleTable = defineTable({
  columns: {
    author: column.text(),
    body: column.text(),
  },
});
