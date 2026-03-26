import { useState, useEffect, useCallback } from 'react';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export interface RelatedArticle {
  slug: string;
  title: string;
  summary: string;
  category: string;
}

export interface Article {
  id: string;
  slug: string;
  category: string;
  image_url: string | null;
  title: string;
  summary: string;
  content: string;
  tags: string[];
  created_at: string;
  updated_at: string;
  related: RelatedArticle[];
}

export function useArticle(slug: string | undefined, language: string = 'pt') {
  const [article, setArticle] = useState<Article | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchArticle = useCallback(async () => {
    if (!slug) {
      setIsLoading(false);
      setError('Slug is required');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${SUPABASE_URL}/functions/v1/get-article?slug=${encodeURIComponent(slug)}&language=${language}`,
        {
          headers: {
            Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
          },
        }
      );

      if (!response.ok) {
        if (response.status === 404) {
          setError('Article not found');
        } else {
          setError('Failed to fetch article');
        }
        setArticle(null);
        return;
      }

      const data = await response.json();
      setArticle(data);
    } catch (err) {
      console.error('Fetch article error:', err);
      setError('Failed to fetch article');
      setArticle(null);
    } finally {
      setIsLoading(false);
    }
  }, [slug, language]);

  useEffect(() => {
    fetchArticle();
  }, [fetchArticle]);

  return { article, isLoading, error, refetch: fetchArticle };
}
