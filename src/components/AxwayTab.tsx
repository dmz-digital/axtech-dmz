import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useFirecrawl } from '../hooks/useFirecrawl';
import { SearchResultSkeleton } from './Skeleton';
import { ExternalLink } from 'lucide-react';

interface AxwayTabProps {
  query: string;
}

export default function AxwayTab({ query }: AxwayTabProps) {
  const { t } = useTranslation();
  const { search, isSearching, results, hasSearched, error } = useFirecrawl();
  const lastSearchedQuery = useRef<string | null>(null);

  useEffect(() => {
    if (query && lastSearchedQuery.current !== query && !isSearching) {
      lastSearchedQuery.current = query;
      search(query);
    }
  }, [query, search, isSearching]);

  if (isSearching) {
    return (
      <div className="space-y-4">
        <SearchResultSkeleton />
        <SearchResultSkeleton />
        <SearchResultSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 flex flex-col items-start gap-3">
        <p>Erro ao buscar na Axway: {error}</p>
        <button
          onClick={() => {
            lastSearchedQuery.current = null;
            search(query);
          }}
          className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg text-sm font-medium transition-colors"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  if (!hasSearched) {
    return null;
  }

  return (
    <>
      <p className="text-gray-600 mb-6">
        {results.length > 0
          ? t('search.results_found', { count: results.length, query })
          : t('search.no_results')}
      </p>

      <div className="space-y-4">
        {results.map((result, index) => (
          <a
            key={index}
            href={result.sourceURL}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow overflow-hidden flex"
            style={{ animation: `fadeSlideUp 0.4s ease-out ${index * 0.1}s both` }}
          >
            {/* Imagem (Esquerda) */}
            <div className="w-32 sm:w-44 flex-shrink-0 relative overflow-hidden bg-gray-50 border-r border-gray-100 hidden sm:block">
              <img
                src={result.image}
                alt={result.title}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                style={{ minHeight: '100%' }}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/5" />
            </div>

            {/* Conteúdo (Direita) */}
            <div className="flex-1 p-5 min-w-0">
              <div className="flex items-start justify-between gap-4 mb-2">
                <h3 className="text-lg font-semibold text-gray-900 leading-snug hover:text-teal-700 transition-colors">
                  {result.title}
                </h3>
                <span className="p-1.5 rounded-full bg-teal-50 text-teal-600 shrink-0">
                  <ExternalLink className="w-4 h-4" />
                </span>
              </div>
              
              {result.description && (
                <p className="text-gray-600 mb-3 text-sm line-clamp-2">
                  {result.description}
                </p>
              )}
              
              {result.snippet && (
                <p className="text-gray-400 text-xs italic line-clamp-2 pl-2 border-l-2 border-gray-200 mt-2">
                  "... {result.snippet} ..."
                </p>
              )}
            </div>
          </a>
        ))}
      </div>
    </>
  );
}
