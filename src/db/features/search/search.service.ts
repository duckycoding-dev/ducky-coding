import { searchRepository } from './search.repository';
import type { SearchResponse } from './search.types';
import { SearchParamsSchema } from './search.types';

const search = async (rawParams: unknown): Promise<SearchResponse> => {
  const parseResult = SearchParamsSchema.safeParse(rawParams);
  if (!parseResult.success) {
    return {
      success: false,
      error: parseResult.error.issues.map((issue) => issue.message).join('; '),
    };
  }

  const params = parseResult.data;

  try {
    const includesPosts = params.type === 'all' || params.type === 'post';
    const includesMemes = params.type === 'all' || params.type === 'meme';

    const [postsResult, memesResult] = await Promise.all([
      includesPosts
        ? searchRepository.searchPosts(params)
        : Promise.resolve({ results: [], total: 0 }),
      includesMemes
        ? searchRepository.searchMemes({ ...params, topics: undefined })
        : Promise.resolve({ results: [], total: 0 }),
    ]);

    return {
      success: true,
      data: {
        posts: postsResult.results,
        memes: memesResult.results,
        totalPosts: postsResult.total,
        totalMemes: memesResult.total,
        page: params.page,
        pageSize: params.pageSize,
      },
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Search failed';
    return { success: false, error: message };
  }
};

export const searchService = {
  search,
};
