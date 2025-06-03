export const AuthorPerson = (authorName: string, url: string) => ({
  '@type': 'Person',
  name: authorName,
  url: url,
  ...(authorName.toLowerCase() === 'duckycoding' && {
    sameAs: [
      'https://x.com/ducky_coding',
      'https://github.com/duckycoding-dev',
    ],
  }),
});
