import type { SelectTopic } from '../../../../db/tables/TopicsTable/TopicsTable';

const getAll = async (): Promise<SelectTopic[]> => {
  const url = `${import.meta.env.PUBLIC_BASE_SITE_URL}/api/v1/topics.json`;
  console.log('Fetching topics from:', url);
  try {
    const response = await fetch(url);
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
