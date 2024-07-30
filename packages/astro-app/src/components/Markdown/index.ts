import CustomH1 from './CustomH1.astro';
import CustomH2 from './CustomH2.astro';
import CustomH3 from './CustomH3.astro';
import CustomH4 from './CustomH4.astro';
import CustomH5 from './CustomH5.astro';
import CustomH6 from './CustomH6.astro';
import CustomP from './CustomP.astro';
import CustomA from './CustomA.astro';
import CustomBlockquote from './CustomBlockquote.astro';
import CustomUl from './CustomUl.astro';
import CustomOl from './CustomOl.astro';
import CustomLi from './CustomLi.astro';
import CustomTable from './CustomTable.astro';
import CustomThead from './CustomThead.astro';
import CustomTbody from './CustomTbody.astro';
import CustomTr from './CustomTr.astro';
import CustomTh from './CustomTh.astro';
import CustomTd from './CustomTd.astro';

export const MarkdownComponents = {
  h1: CustomH1,
  h2: CustomH2,
  h3: CustomH3,
  h4: CustomH4,
  h5: CustomH5,
  h6: CustomH6,
  p: CustomP,
  a: CustomA,
  blockquote: CustomBlockquote,
  ul: CustomUl,
  ol: CustomOl,
  li: CustomLi,
  table: CustomTable,
  thead: CustomThead,
  tbody: CustomTbody,
  tr: CustomTr,
  th: CustomTh,
  td: CustomTd,
};
