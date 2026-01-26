import { ContentItem } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:80';

export const api = {
  async getFeed(limit: number = 10): Promise<ContentItem[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/content/feed?limit=${limit}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();

      // Transform backend data to match frontend ContentItem interface
      return data.map((item: any) => ({
        id: item.id,
        type: item.type,
        url: item.url || '',
        text: item.text || '',
        title: item.title,
        isAi: item.isAi,
        modelTag: item.modelTag,
        authorId: item.author?.id || '',
        provider: item.provider,
        deceptionRate: item.deceptionRate,
        explanation: item.explanation,
        comments: item.comments || []
      }));
    } catch (error) {
      console.error('Failed to fetch feed:', error);
      throw error;
    }
  }
};
