import { createClient } from '@libsql/client';
import { sql } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/libsql';
import { sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import {
  escapeLike,
  likeContains,
} from '../src/db/features/search/search.sql.ts';

describe('escapeLike', () => {
  it('escapes the LIKE metacharacters', () => {
    expect(escapeLike('50%_\\')).toBe('50\\%\\_\\\\');
  });

  it('leaves plain text untouched', () => {
    expect(escapeLike('plain')).toBe('plain');
  });

  it('escapes every occurrence, not just the first', () => {
    expect(escapeLike('%a%b%')).toBe('\\%a\\%b\\%');
  });

  it('handles an empty string', () => {
    expect(escapeLike('')).toBe('');
  });
});

// The ESCAPE clause is only correct if SQLite actually accepts it, so this
// runs the generated SQL against a real database rather than snapshotting it.
describe('likeContains against SQLite', () => {
  const table = sqliteTable('docs', { title: text().primaryKey() });

  let dir: string;
  let db: ReturnType<typeof drizzle>;

  const titlesMatching = async (query: string): Promise<string[]> => {
    const rows = await db
      .select()
      .from(table)
      .where(likeContains(table.title, query))
      .all();

    return rows.map((row) => row.title).sort();
  };

  beforeAll(async () => {
    dir = await mkdtemp(path.join(tmpdir(), 'search-like-'));
    const client = createClient({ url: `file:${path.join(dir, 'like.db')}` });
    db = drizzle({ client, casing: 'snake_case' });

    await db.run(sql`CREATE TABLE docs (title TEXT PRIMARY KEY)`);
    await db
      .insert(table)
      .values([
        { title: 'Plain astro post' },
        { title: 'Discount: 50% off' },
        { title: 'snake_case naming' },
        { title: 'snakeXcase naming' },
        { title: 'A back\\slash' },
      ]);
  });

  afterAll(async () => {
    await rm(dir, { recursive: true, force: true });
  });

  it('finds an ordinary substring', async () => {
    expect(await titlesMatching('astro')).toEqual(['Plain astro post']);
  });

  it('treats % as a literal, not a wildcard', async () => {
    // Before the fix this matched every row.
    expect(await titlesMatching('%')).toEqual(['Discount: 50% off']);
  });

  it('treats _ as a literal, not a single-character wildcard', async () => {
    // 'snakeXcase' must NOT match a query for 'snake_case'.
    expect(await titlesMatching('snake_case')).toEqual(['snake_case naming']);
  });

  it('treats a backslash as a literal', async () => {
    expect(await titlesMatching('back\\slash')).toEqual(['A back\\slash']);
  });

  it('returns nothing for a query that matches no row', async () => {
    expect(await titlesMatching('nonexistent')).toEqual([]);
  });
});
