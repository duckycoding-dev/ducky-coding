import { eq } from 'drizzle-orm';
import { db } from '../client';
import { ImagesTable } from '../models';
import { type SelectTopic, TopicsTable } from '../models/topics.model';

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

const getAll = async () => {
  const topics = await db
    .select()
    .from(TopicsTable)
    .leftJoin(ImagesTable, eq(TopicsTable.imageId, ImagesTable.id))
    .all();
  console.log('davidelog', topics);
  return topics;
};

export const TopicsService = {
  getAll,
};

// Add more methods as needed
