import type { MemeSearchResult, SearchParams } from '../search/search.types';
import { MemesRepository } from './memes.repository';

const searchMemes = async (
  params: SearchParams,
): Promise<{ results: MemeSearchResult[]; total: number }> => {
  return MemesRepository.searchMemes(params);
};

export const MemesService = {
  searchMemes,
};
