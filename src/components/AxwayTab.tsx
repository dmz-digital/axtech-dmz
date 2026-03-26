import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ExternalLink } from 'lucide-react';
import { useAxwaySearch } from '../hooks/useAxwaySearch';
import { SearchResultSkeleton } from './Skeleton';

interface AxwayTabProps {
  query: string;
}

export default function AxwayTab({ query }: AxwayTabProps) {
  const { t } = useTranslation();
  const { search, results, isLoading } = useAxwaySearch();

  useEffect(() => {
    search(query);
  }, [query, search]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <SearchResultSkeleton />
        <SearchResultSkeleton />
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 text-center mt-4">
        <p className="text-gray-500">{t('search.no_results') || 'Nenhum resultado encontrado'}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 mt-6">
      {results.map((result) => (
        <a
          key={result.id || result.url}
          href={result.url}
          target="_blank"
          rel="noopener noreferrer"
          className="block bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:border-teal-200 transition-all hover:shadow-md group"
        >
          <div className="flex justify-between items-start gap-4">
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-teal-700 transition-colors">
                {result.short_description}
              </h3>
              <p className="text-gray-600 line-clamp-3">
                {result.resumo_conteudo}
              </p>
            </div>
            <ExternalLink className="w-5 h-5 text-gray-400 group-hover:text-teal-600 shrink-0" />
          </div>
        </a>
      ))}
    </div>
  );
}
