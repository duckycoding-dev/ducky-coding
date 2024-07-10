import type { Topic } from '@db/tables/TopicsTable/TopicsTable';

const getAll = async (): Promise<Topic[]> => {
  try {
    const response = await fetch(
      `${import.meta.env.PUBLIC_BASE_SITE_URL}/api/v1/topics.json`,
    );
    if (!response.ok) {
      throw new Error('Failed to fetch topics');
    }
    return await response.json();
  } catch (error) {
    console.error('Error in getTopicImages:', error);
    return [];
  }
};

export const TopicsService = {
  getAll,
};

// Add more methods as needed
