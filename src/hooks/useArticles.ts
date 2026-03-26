import { useState, useEffect, useCallback } from 'react';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export interface ArticleListItem {
  id: string;
  slug: string;
  category: string;
  image_url: string | null;
  title: string;
  summary: string;
  tags: string[];
  created_at: string;
}

interface UseArticlesOptions {
  language?: string;
  category?: string;
  limit?: number;
  offset?: number;
}

export function useArticles(options: UseArticlesOptions = {}) {
  const { language = 'pt', category, limit = 20, offset = 0 } = options;

  const [articles, setArticles] = useState<ArticleListItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchArticles = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        language,
        limit: String(limit),
        offset: String(offset),
      });

      if (category) {
        params.set('category', category);
      }

      const response = await fetch(
        `${SUPABASE_URL}/functions/v1/list-articles?${params.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch articles');
      }

      const data = await response.json();
      setArticles(data.results || []);
    } catch (err) {
      console.error('Fetch articles error:', err);
      setError('Failed to fetch articles');
      setArticles([]);
    } finally {
      setIsLoading(false);
    }
  }, [language, category, limit, offset]);

  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

  return { articles, isLoading, error, refetch: fetchArticles };
}
