import { getCollection } from 'astro:content';

import { formatReadTime } from '../../read-time/read-time.ts';
import { renderCardShell, TITLE_BOX } from '../card-shell.ts';
import type { OgCardKind, OgRenderContext } from '../types.ts';
import { pickChips } from './post-rules.ts';

export { pickChips };

/**
 * Published posts only.
 *
 * Filters after the call rather than using `getCollection`'s filter argument,
 * matching how every other page in the repo does it — see `src/pages/blog.astro`
 * and `src/pages/topics/[topic]/index.astro`.
 */
async function publishedPosts(): Promise<
  Awaited<ReturnType<typeof getCollection<'posts'>>>
> {
  return (await getCollection('posts')).filter(
    (post) => post.data.status === 'published',
  );
}

/**
 * The blog-post card kind.
 *
 * Everything post-specific lives here: which entries exist, how they are
 * identified, and how one becomes HTML. The route and the registry know none of
 * it — they only pass a kind string and an id.
 */
export const postCardKind: OgCardKind = {
  kind: 'posts',

  async listIds(): Promise<string[]> {
    const posts = await publishedPosts();
    return posts.map((post) => post.id);
  },

  async renderById(id: string, ctx: OgRenderContext): Promise<string> {
    const posts = await publishedPosts();
    const post = posts.find((candidate) => candidate.id === id);
    if (post === undefined) {
      throw new Error(`No published post with id "${id}"`);
    }

    const { title, topicTitle, tags, timeToRead } = post.data;
    const fitted = await ctx.fitTitle(title, TITLE_BOX);

    return renderCardShell({
      eyebrow: `/posts/${id}`,
      title: fitted.text,
      titleFontSize: fitted.fontSize,
      chips: pickChips(topicTitle, tags),
      trailing: formatReadTime(timeToRead),
      logoPath: ctx.logoPath,
      width: ctx.width,
      height: ctx.height,
    });
  },
};
