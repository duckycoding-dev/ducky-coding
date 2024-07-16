import { db } from '@db/client';
import {
  TopicsTable,
  type SelectTopic,
} from '@db/tables/TopicsTable/TopicsTable';

// This commented getAll function is how I would call a server, but I will replace this with a direct db call instead

// const getAll = async (): Promise<SelectTopic[]> => {
//   const url = `${import.meta.env.PUBLIC_BASE_SITE_URL}/api/v1/topics.json`;
//   console.log('Fetching topics from:', url);
//   try {
//     const response = await fetch(url);
//     if (!response.ok) {
//       throw new Error('Failed to fetch topics');
//     }
//     return await response.json();
//   } catch (error) {
//     console.error('Error in getTopicImages:', error);
//     return [];
//   }
// };

const getAll = async (): Promise<SelectTopic[]> => {
  const topics: SelectTopic[] = await db.select().from(TopicsTable).all();
  return topics;
};

export const TopicsService = {
  getAll,
};

// Add more methods as needed
