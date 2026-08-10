import type { APIRoute } from 'astro';
import { getImage } from 'astro:assets';
import { getCollection } from 'astro:content';
import rss from '@astrojs/rss';
import MarkdownIt from 'markdown-it';
import sanitizeHtml from 'sanitize-html';

import { PostsService } from '../db/features/posts/posts.service';
import { matchImageFromGlobImport } from '../utils/images/images';
import { serverLogger } from '../utils/logs/logger';

const parser = new MarkdownIt();

/** Width of the optimised banner used as the RSS enclosure. */
const RSS_ENCLOSURE_WIDTH = 1200;

export const GET: APIRoute = async (context) => {
  const postsCollection = await getCollection('posts');
  const images = import.meta.glob<{ default: ImageMetadata }>(
    `/src/assets/images/**/*.{jpeg,jpg,png,gif,webp,svg}`,
  );

  const postsWithBannerImage = await PostsService.getPostsWithBannerBySlugs(
    postsCollection
      .filter((post) => post.data.status === 'published')
      .map((post) => post.id),
  );

  const processedPostsWithImages = await Promise.all(
    postsWithBannerImage.map(async ({ post }) => {
      let processedImage: ImageMetadata | undefined;
      const imageToFindPath = `${post.bannerImagePath}`;
      if (imageToFindPath) {
        processedImage = await matchImageFromGlobImport(
          images,
          imageToFindPath,
          serverLogger,
        );
      }

      const postTags =
        postsCollection.find((p) => p.id === post.slug)?.data?.tags || [];

      // The enclosure must not reference `processedImage.src`: that is the
      // original asset, and referencing it makes Astro emit the full-size source
      // file — megabytes shipped purely for a feed URL.
      const enclosureImage = processedImage
        ? {
            src: (
              await getImage({
                src: processedImage,
                width: RSS_ENCLOSURE_WIDTH,
                format: 'webp',
              })
            ).src,
            width: RSS_ENCLOSURE_WIDTH,
            height: Math.round(
              (RSS_ENCLOSURE_WIDTH * processedImage.height) /
                processedImage.width,
            ),
            format: 'webp',
          }
        : null;

      return {
        ...post,
        processedBannerImage: enclosureImage,
        tags: postTags,
      };
    }),
  );

  return rss({
    // `<title>` field in output xml
    title: "DuckyCoding's blog",
    // `<description>` field in output xml
    description:
      'Web development blog featuring tutorials, guides, and insights about modern web technologies, brought to you by DuckyCoding.',
    // Pull in your project "site" from the endpoint context
    // https://docs.astro.build/en/reference/api-reference/#site
    site: context.site
      ? `${context.site}/blog`
      : 'https://duckycoding.dev/blog',
    // Array of `<item>`s in output xml
    // See "Generating items" section for examples using content collections and glob imports
    items: processedPostsWithImages.map((post) => ({
      author: post.author,
      categories: post.tags,
      customData: `<language>${post.language}</language>`,
      commentsUrl: undefined,
      source: undefined,
      title: post.title,
      enclosure: post.processedBannerImage
        ? {
            length:
              (post.processedBannerImage.height ?? 1) *
              (post.processedBannerImage.width ?? 1), // currently using area as file size approximation
            type: `image/${post.processedBannerImage.format || 'jpeg'}`,
            url: post.processedBannerImage.src,
          }
        : undefined,
      pubDate: post.publishedAt ? new Date(post.publishedAt) : new Date(),
      description: post.summary,
      // Compute RSS link from post `id`
      // This example assumes all posts are rendered as `/posts/[id]` routes
      link: `/posts/${post.slug}/`,
      content: sanitizeHtml(parser.render(post.content), {
        allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img']),
      }),
    })),
    // (optional) inject custom xml
    // customData: `<language>en-us</language>`,
  });
};
