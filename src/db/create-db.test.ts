import { existsSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';

import { createDb } from './create-db.ts';

const root = path.join(tmpdir(), 'ducky-create-db-test');

afterEach(() => {
  rmSync(root, { recursive: true, force: true });
});

describe('createDb', () => {
  it('creates the parent directory of a file: database', () => {
    // The regression this pins: `database/` is gitignored, so a fresh clone has
    // no such directory and libSQL fails with `ConnectionFailed(… 14)` rather
    // than creating it. That broke every cold build.
    const target = path.join(root, 'nested', 'content.db');
    expect(existsSync(path.dirname(target))).toBe(false);

    createDb({ url: `file:${target}` });

    expect(existsSync(path.dirname(target))).toBe(true);
  });

  it('leaves remote urls alone', () => {
    expect(() =>
      createDb({ url: 'libsql://example.turso.io', authToken: 'x' }),
    ).not.toThrow();
  });

  it('does not treat :memory: as a path', () => {
    expect(() => createDb({ url: 'file::memory:' })).not.toThrow();
  });
});
