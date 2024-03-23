import { defineDb } from 'astro:db';
import { allDefinedTables } from './tables';

// https://astro.build/db/config
export default defineDb({
  tables: { allDefinedTables },
});
