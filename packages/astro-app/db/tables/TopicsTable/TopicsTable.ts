import { column, defineTable } from 'astro:db';
import { TagsTable } from '../TagsTable';

export const TopicsTable = defineTable({
  columns: {
    title: column.text({
      primaryKey: true,
      unique: true,
      optional: false,
    }),
    imageFilename: column.text(),
    imageAlt: column.text(),
  },
  foreignKeys: [
    {
      columns: ['title'],
      references: () => TagsTable.columns.name,
    },
  ],
});

export type Topic = {
  title: string;
  imageFilename?: string;
  imageAlt?: string;
};

// Type for inserting new topics (in this case, it's the same as Topic)
export type InsertTopic = Topic;
