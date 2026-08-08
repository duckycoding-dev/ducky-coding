import CustomA from './CustomA.astro';

// Markdown element styling lives in src/styles/markdown.css.
// Add a wrapper component here only when CSS alone can't express the change
// (see CustomA for the pattern).

export const MarkdownComponents = {
  a: CustomA,
};
