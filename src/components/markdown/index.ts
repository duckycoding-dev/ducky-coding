import CustomA from './CustomA.astro';

// Commented Custom components are commented because we are relying on Tailwind's typography plugin: if more customization is needed
// we will customize the components themselves, and use them here

export const MarkdownComponents = {
  a: CustomA,
  // h1: CustomH1,
  // h2: CustomH2,
  // h3: CustomH3,
  // h4: CustomH4,
  // h5: CustomH5,
  // h6: CustomH6,
  // p: CustomP,
  // blockquote: CustomBlockquote,
  // ul: CustomUl,
  // ol: CustomOl,
  // li: CustomLi,
  // table: CustomTable,
  // thead: CustomThead,
  // tbody: CustomTbody,
  // tr: CustomTr,
  // th: CustomTh,
  // td: CustomTd,
};
