import { ExampleTable } from './ExampleTable';
import { TopicTagsTable } from './TopicTags';
import { TopicsTable } from './Topics';

export const allDefinedTables = {
  ExampleTable,
  TopicsTable,
  TopicTagsTable,
};

/*
Every table will be created in its own file, and exported from there: in this index file we import all the tables and export them all as a single unique export
*/
