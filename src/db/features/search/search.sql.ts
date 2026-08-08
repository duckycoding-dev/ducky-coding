import { type SQL, sql, type SQLWrapper } from 'drizzle-orm';

/**
 * Escape the LIKE metacharacters so a user query is matched literally.
 * Without this, `q=%` matches every row and `_` matches any single character.
 * Only meaningful together with the ESCAPE clause emitted by `likeContains`.
 */
export const escapeLike = (value: string): string =>
  value.replace(/[\\%_]/g, (char) => `\\${char}`);

/**
 * `<column> LIKE '%<escaped query>%' ESCAPE '\'` — a literal substring match.
 *
 * Kept free of any DB-client import so it can be unit tested and shared by
 * every repository that searches text columns.
 */
export const likeContains = (column: SQLWrapper, query: string): SQL =>
  // The doubled backslash is a JS escape: the SQL text emitted is
  // ESCAPE '\' — a single backslash, which is what SQLite requires.
  sql`${column} LIKE ${`%${escapeLike(query)}%`} ESCAPE '\\'`;
