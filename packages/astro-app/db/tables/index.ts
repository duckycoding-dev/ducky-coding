import { ExampleTable } from './ExampleTable';
import { TagsTable } from './TagsTable';
import { TopicsTable } from './TopicsTable';

export const allDefinedTables = {
  ExampleTable,
  TopicsTable,
  TagsTable,
};

/*
Every table will be created in its own file, and exported from there: in this index file we import all the tables and export them all as a single unique export
*/
