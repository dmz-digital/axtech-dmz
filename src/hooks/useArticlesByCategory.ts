import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

export interface CategoryArticle {
  id: string;
  slug: string;
  category: string;
  title: string;
  summary: string;
  image_url: string | null;
  tags: string[];
  created_at: string;
}

export function useArticlesByCategory(category: string, limit = 6) {
  const { i18n } = useTranslation();
  const [articles, setArticles] = useState<CategoryArticle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!category) return;

    setIsLoading(true);
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    const lang = i18n.language || 'pt';
    const params = new URLSearchParams({ category, lang, limit: String(limit) });

    fetch(`${supabaseUrl}/functions/v1/list-articles-by-category?${params}`, {
      headers: { Authorization: `Bearer ${supabaseKey}`, apikey: supabaseKey },
    })
      .then((res) => res.json())
      .then((data) => setArticles(data.articles || []))
      .catch((err) => setError(err instanceof Error ? err.message : 'Unknown error'))
      .finally(() => setIsLoading(false));
  }, [category, limit, i18n.language]);

  return { articles, isLoading, error };
}
