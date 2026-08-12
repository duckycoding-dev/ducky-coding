import { describe, expect, it } from 'vitest';

import {
  memeImageTransitionName,
  postImageTransitionName,
} from './view-transition-name';

describe('postImageTransitionName', () => {
  it('builds the same stable name for a post card and its article hero', () => {
    expect(postImageTransitionName('image-srcset-and-sizes-attributes')).toBe(
      'post-image-image-srcset-and-sizes-attributes',
    );
  });

  it('normalizes characters that cannot be used in a CSS custom identifier', () => {
    expect(postImageTransitionName('A post / with spaces')).toBe(
      'post-image-a-post-with-spaces',
    );
  });
});

describe('memeImageTransitionName', () => {
  it('builds a meme-specific stable name for its gallery and detail images', () => {
    expect(memeImageTransitionName('new-framework-beta')).toBe(
      'meme-image-new-framework-beta',
    );
  });
});
