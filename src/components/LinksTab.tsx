import { useTranslation } from 'react-i18next';
import { SearchResult } from '../hooks/useSemanticSearch';
import SearchResultCard from './SearchResultCard';
import { SearchResultSkeleton } from './Skeleton';

interface LinksTabProps {
  results: SearchResult[];
  query: string;
  isLoading: boolean;
  hasSearched: boolean;
}

export default function LinksTab({ results, query, isLoading, hasSearched }: LinksTabProps) {
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <SearchResultSkeleton />
        <SearchResultSkeleton />
        <SearchResultSkeleton />
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
          <SearchResultCard key={result.id} result={result} index={index} />
        ))}
      </div>
    </>
  );
}
