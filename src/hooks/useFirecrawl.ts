import { useState, useCallback } from 'react';

export interface FirecrawlResult {
  title: string;
  sourceURL: string;
  snippet: string;
  description: string;
  image?: string;
}

export function useFirecrawl() {
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<FirecrawlResult[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const extractSnippet = (markdown: string, query: string): string => {
    if (!markdown || !query) return '';
    const lowerMarkdown = markdown.toLowerCase();
    const lowerQuery = query.toLowerCase();

    const index = lowerMarkdown.indexOf(lowerQuery);
    if (index === -1) {
      return markdown.substring(0, 150).replace(/\n/g, ' ') + '...';
    }

    const start = Math.max(0, index - 60);
    const end = Math.min(markdown.length, index + query.length + 60);

    let snippet = markdown.substring(start, end).replace(/\n/g, ' ');
    if (start > 0) snippet = '...' + snippet;
    if (end < markdown.length) snippet = snippet + '...';

    return snippet;
  };

  const search = useCallback(async (query: string) => {
    if (!query.trim()) return;

    setIsSearching(true);
    setError(null);
    setHasSearched(false);

    try {
      const apiKey = import.meta.env.VITE_FIRECRAWL_API_KEY || '';
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      };

      const payload = {
        url: 'https://axway.com',
        prompt: 'Rastreie páginas de produtos, soluções, documentação e recursos que correspondam ao termo buscado pelo usuário',
        limit: 10,
        scrapeOptions: {
          formats: ['markdown'],
          onlyMainContent: true,
        }
      };

      const res = await fetch('https://api.firecrawl.dev/v2/crawl', {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error(`Failed to start crawl: ${res.statusText}`);
      }

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to start crawl - Api returned false success flag');
      }

      const jobId = data.id;

      // Polling a cada 3 segundos
      let statusData;
      do {
        await new Promise(resolve => setTimeout(resolve, 3000));

        const statusRes = await fetch(`https://api.firecrawl.dev/v2/crawl/${jobId}`, {
          method: 'GET',
          headers,
        });

        if (!statusRes.ok) {
          throw new Error('Failed to check crawl status');
        }

        statusData = await statusRes.json();
      } while (statusData.status !== 'completed' && statusData.status !== 'failed');

      if (statusData.status === 'failed') {
        throw new Error('Crawl failed in Firecrawl status response');
      }

      const pages = statusData.data || [];
      const lowerQuery = query.toLowerCase();

      const matchedResults: FirecrawlResult[] = [];

      for (const page of pages) {
        const markdown = page.markdown || '';
        if (markdown.toLowerCase().includes(lowerQuery) || (page.metadata?.title || '').toLowerCase().includes(lowerQuery)) {
          let imageUrl = page.metadata?.ogImage || page.metadata?.['og:image'] || page.metadata?.image || '';
          if (imageUrl && !imageUrl.startsWith('http')) {
            try {
              imageUrl = new URL(imageUrl, page.metadata?.sourceURL || 'https://axway.com').href;
            } catch (e) {
              // Ignore invalid url
            }
          }
          if (!imageUrl) {
            imageUrl = 'https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop';
          }

          matchedResults.push({
            title: page.metadata?.title || 'Sem título',
            sourceURL: page.metadata?.sourceURL || '',
            snippet: extractSnippet(markdown, query),
            description: page.metadata?.description || '',
            image: imageUrl,
          });
        }
      }

      setResults(matchedResults);
    } catch (err: any) {
      console.error('Firecrawl search error:', err);
      setError(err.message || 'Erro ao buscar no Firecrawl');
      setResults([]);
    } finally {
      setIsSearching(false);
      setHasSearched(true);
    }
  }, []);

  return { search, isSearching, results, hasSearched, error };
}
