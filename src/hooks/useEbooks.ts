import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

export interface Ebook {
  id: string;
  slug: string;
  category: string;
  cover_image_url: string;
  title: string;
  summary: string;
  tags: string[];
  download_count: number;
  created_at: string;
}

interface UseEbooksResult {
  ebooks: Ebook[];
  loading: boolean;
  error: string | null;
}

export function useEbooks(category?: string): UseEbooksResult {
  const { i18n } = useTranslation();
  const [ebooks, setEbooks] = useState<Ebook[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEbooks = async () => {
      setLoading(true);
      setError(null);

      try {
        const lang = i18n.language.startsWith('pt') ? 'pt' : 'en';
        const params = new URLSearchParams({ lang });
        if (category) {
          params.append('category', category);
        }

        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/list-ebooks?${params}`,
          {
            headers: {
              Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error('Failed to fetch ebooks');
        }

        const data = await response.json();
        setEbooks(data.ebooks || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchEbooks();
  }, [i18n.language, category]);

  return { ebooks, loading, error };
}

export function useEbook(slug: string | undefined) {
  const { i18n } = useTranslation();
  const [ebook, setEbook] = useState<Ebook | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) {
      setLoading(false);
      return;
    }

    const fetchEbook = async () => {
      setLoading(true);
      setError(null);

      try {
        const lang = i18n.language.startsWith('pt') ? 'pt' : 'en';
        const params = new URLSearchParams({ slug, lang });

        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/get-ebook?${params}`,
          {
            headers: {
              Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error('Ebook not found');
        }

        const data = await response.json();
        setEbook(data.ebook || null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchEbook();
  }, [slug, i18n.language]);

  return { ebook, loading, error };
}
