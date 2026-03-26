import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export interface EdicaoEspecial {
  slug: string;
  cover_image_path: string;
}

export function useEdicaoEspecial() {
  const [ebook, setEbook] = useState<EdicaoEspecial | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from('ebooks')
        .select('slug, cover_image_path')
        .eq('edicao_especial', true)
        .eq('is_published', true)
        .maybeSingle();

      setEbook(data ?? null);
      setLoading(false);
    };

    fetch();
  }, []);

  return { ebook, loading };
}
