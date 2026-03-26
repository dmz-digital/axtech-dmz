import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export interface AxwayResource {
  id: string;
  short_description: string;
  resumo_conteudo: string;
  url: string;
}

export function useAxwaySearch() {
  const [results, setResults] = useState<AxwayResource[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const search = useCallback(async (query: string) => {
    if (!query) {
      setResults([]);
      return;
    }
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('axway_resources')
        .select('*')
        .or(`short_description.ilike.%${query}%,resumo_conteudo.ilike.%${query}%`)
        .limit(20);

      if (error) throw error;
      setResults(data as AxwayResource[] || []);
    } catch (error) {
      console.error('Error fetching axway resources:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { search, results, isLoading };
}
