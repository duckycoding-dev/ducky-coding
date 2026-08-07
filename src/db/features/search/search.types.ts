import { z } from 'zod';

// ---------------------------------------------------------------------------
// Search input
// ---------------------------------------------------------------------------

export const SearchParamsSchema = z.object({
  q: z.string().min(1).optional(),
  tags: z
    .string()
    .transform((s) => s.split(',').filter(Boolean))
    .pipe(z.array(z.string().min(1)).min(1))
    .optional(),
  topics: z
    .string()
    .transform((s) => s.split(',').filter(Boolean))
    .pipe(z.array(z.string().min(1)).min(1))
    .optional(),
  type: z.enum(['post', 'meme', 'all']).default('all'),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

export type SearchParams = z.infer<typeof SearchParamsSchema>;

// ---------------------------------------------------------------------------
// Search output
// ---------------------------------------------------------------------------

export interface PostSearchResult {
  id: number;
  slug: string;
  title: string;
  summary: string;
  author: string;
  topicTitle: string;
  bannerImagePath: string | null;
  publishedAt: number | null;
  timeToRead: number;
  tags: string[];
}

export interface MemeSearchResult {
  id: number;
  slug: string;
  title: string;
  author: string;
  imagePath: string;
  imageAlt: string;
  createdAt: number;
  tags: string[];
}

export interface SearchData {
  posts: PostSearchResult[];
  memes: MemeSearchResult[];
  totalPosts: number;
  totalMemes: number;
  page: number;
  pageSize: number;
}

export type SearchResponse =
  | { success: true; data: SearchData }
  | { success: false; error: string };
