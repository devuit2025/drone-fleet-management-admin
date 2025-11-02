import { api } from '@/api/axios';

export interface GlobalSearchResult {
  type: string;
  id: number;
  title: string;
  subtitle?: string;
  data: any;
}

export interface SearchCounts {
  [key: string]: number;
}

export const searchAll = (query: string, options?: { limit?: number; entities?: string[] }) => {
  const params: Record<string, any> = { q: query };
  if (options?.limit) {
    params.limit = options.limit;
  }
  if (options?.entities) {
    params.entities = options.entities.join(',');
  }
  return api.get<GlobalSearchResult[]>('/search', { params });
};

export const getSearchCounts = (query: string) => {
  return api.get<SearchCounts>('/search/counts', { params: { q: query } });
};

