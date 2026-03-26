import { useState, useCallback } from 'react';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export interface SearchResult {
  id: string;
  slug: string;
  content_type: string;
  score: number;
  title: string;
  summary: string;
  category: string;
  tags: string[];
  image_url: string | null;
}

interface ApiSearchResult {
  id: string;
  slug: string;
  content_type: string;
  category: string;
  image_url: string | null;
  title: string;
  summary: string;
  tags: string[];
  rank?: number;
}

export interface SearchOptions {
  query?: string;
  category?: string;
  tag?: string;
  language?: string;
  limit?: number;
}

export function useSemanticSearch() {
  const [isSearching, setIsSearching] = useState(false);

  const search = useCallback(async (options: SearchOptions): Promise<SearchResult[]> => {
    const { query, category, tag, language = 'pt', limit = 20 } = options;

    const isBrowse = !query || query.trim().length === 0;
    if (isBrowse && !category && !tag) return [];

    setIsSearching(true);

    try {
      const params = new URLSearchParams({ language, limit: String(limit) });
      if (query) params.set('query', query);
      if (category) params.set('category', category);
      if (tag) params.set('tag', tag);

      const url = `${SUPABASE_URL}/functions/v1/search-articles?${params.toString()}`;

      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${SUPABASE_ANON_KEY}` },
      });

      if (!response.ok) throw new Error('Search failed');

      const data = await response.json();

      const results: SearchResult[] = (data.results || []).map((r: ApiSearchResult) => ({
        id: r.id,
        slug: r.slug,
        content_type: r.content_type || 'article',
        title: r.title,
        summary: r.summary,
        category: r.category,
        tags: r.tags || [],
        image_url: r.image_url,
        score: r.rank || 0,
      }));

      return results;
    } catch (error) {
      console.error('Search error:', error);
      return [];
    } finally {
      setIsSearching(false);
    }
  }, []);

  return { search, isSearching };
}
