function contentImageTransitionName(
  contentKind: 'meme' | 'post',
  slug: string,
): string {
  const normalizedSlug = slug
    .trim()
    .toLocaleLowerCase('en-US')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  return `${contentKind}-image-${normalizedSlug}`;
}

export function postImageTransitionName(slug: string): string {
  return contentImageTransitionName('post', slug);
}

export function memeImageTransitionName(slug: string): string {
  return contentImageTransitionName('meme', slug);
}
