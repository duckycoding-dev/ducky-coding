import { column, defineTable } from 'astro:db';
import { TopicTagsTable } from '../TopicTags';

export const TopicsTable = defineTable({
  columns: {
    title: column.text({ primaryKey: true, unique: true }),
    tags: column.text({ references: () => TopicTagsTable.columns.name }),
    imageSrc: column.text(),
    imageAlt: column.text(),
  },
});
