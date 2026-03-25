import { useEffect, useState, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowRight, X, Tag, Layers } from 'lucide-react';
import { useSemanticSearch, SearchResult } from '../hooks/useSemanticSearch';
import SearchResultsTabs, { TabType } from '../components/SearchResultsTabs';
import AnswerTab from '../components/AnswerTab';
import LinksTab from '../components/LinksTab';
import EbooksTab from '../components/EbooksTab';
import AxwayTab from '../components/AxwayTab';
import { SearchResultSkeleton } from '../components/Skeleton';
import SearchResultCard from '../components/SearchResultCard';

const CATEGORY_LABELS: Record<string, string> = {
  banking: 'Banking e Financial Services',
  'life-science': 'Life Science',
  healthcare: 'HealthCare',
  automotivo: 'Automotivo',
  energia: 'Energia e Utilitários',
  governo: 'Governo',
  'setor-publico': 'Setor Público',
  manufatura: 'Manufatura e Packaged Goods',
  transporte: 'Transporte e Logística',
  varejo: 'Varejo',
};

type SearchMode = 'query' | 'category' | 'tag' | 'combined';

function getMode(q: string, cat: string, tag: string): SearchMode {
  const hasQ = !!q;
  const hasCat = !!cat;
  const hasTag = !!tag;
  if (hasQ && (hasCat || hasTag)) return 'combined';
  if (hasQ) return 'query';
  if (hasCat) return 'category';
  if (hasTag) return 'tag';
  return 'query';
}

function ActiveFilter({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm bg-teal-50 text-teal-700 border border-teal-200">
      {label}
      <button onClick={onRemove} className="hover:text-teal-900 transition-colors ml-0.5">
        <X className="w-3.5 h-3.5" />
      </button>
    </span>
  );
}

function BrowseResultCard({ result, index }: { result: SearchResult; index: number }) {
  return <SearchResultCard result={result} index={index} />;
}

export default function SearchResultsPage() {
  const { t, i18n } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { search, isSearching } = useSemanticSearch();

  const query = searchParams.get('q') || '';
  const category = searchParams.get('category') || '';
  const tag = searchParams.get('tag') || '';

  const [results, setResults] = useState<SearchResult[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [inputValue, setInputValue] = useState(query);
  const [activeTab, setActiveTab] = useState<TabType>('resposta');

  const language = i18n.language.startsWith('pt') ? 'pt' : 'en';
  const mode = getMode(query, category, tag);
  const isBrowse = mode === 'category' || mode === 'tag';

  const doSearch = useCallback(async () => {
    const res = await search({ query: query || undefined, category: category || undefined, tag: tag || undefined, language });
    setResults(res);
    setHasSearched(true);
    if (!isBrowse) setActiveTab('resposta');
  }, [query, category, tag, language, search, isBrowse]);

  useEffect(() => {
    setHasSearched(false);
    setResults([]);
  }, [query, category, tag]);

  useEffect(() => {
    if (!hasSearched) {
      doSearch();
    }
  }, [hasSearched, doSearch]);

  useEffect(() => {
    setInputValue(query);
  }, [query]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = inputValue.trim();
    if (!trimmed) return;
    const params: Record<string, string> = { q: trimmed };
    if (category) params.category = category;
    if (tag) params.tag = tag;
    navigate(`/results?${new URLSearchParams(params).toString()}`);
  };

  const removeFilter = (key: 'q' | 'category' | 'tag') => {
    const next = new URLSearchParams(searchParams);
    next.delete(key);
    if (key === 'q') setInputValue('');
    setSearchParams(next);
  };

  const isLoading = isSearching;

  const articleResults = results.filter((r) => r.content_type !== 'ebook');
  const ebookResults = results.filter((r) => r.content_type === 'ebook');

  const pageTitle = () => {
    if (mode === 'category') return CATEGORY_LABELS[category] || category;
    if (mode === 'tag') return tag;
    return query;
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F0F2F5' }}>
      <div className="max-w-4xl mx-auto px-4 py-8">

        {/* Search bar */}
        <form onSubmit={handleSearch} className="relative mb-5">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={t('search.placeholder')}
            className="w-full px-6 py-4 pr-14 rounded-xl border border-gray-200 focus:border-teal-600 focus:outline-none text-lg shadow-sm bg-white placeholder:font-light placeholder:text-gray-400"
          />
          <button
            type="submit"
            disabled={!inputValue.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 rounded-lg transition-colors disabled:opacity-40"
            style={{ backgroundColor: '#E85D4A' }}
          >
            <ArrowRight className="w-5 h-5 text-white" />
          </button>
        </form>

        {/* Active filters */}
        {(query || category || tag) && (
          <div className="flex flex-wrap gap-2 mb-5">
            {query && (
              <ActiveFilter
                label={`"${query}"`}
                onRemove={() => removeFilter('q')}
              />
            )}
            {category && (
              <ActiveFilter
                label={CATEGORY_LABELS[category] || category}
                onRemove={() => removeFilter('category')}
              />
            )}
            {tag && (
              <ActiveFilter
                label={`#${tag}`}
                onRemove={() => removeFilter('tag')}
              />
            )}
          </div>
        )}

        {/* Browse mode heading */}
        {isBrowse && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-1">
              {mode === 'tag' ? (
                <Tag className="w-5 h-5 text-teal-600" />
              ) : (
                <Layers className="w-5 h-5 text-teal-600" />
              )}
              <h1 className="text-2xl font-bold text-gray-900">{pageTitle()}</h1>
            </div>
            {hasSearched && !isLoading && (
              <p className="text-sm text-gray-500">
                {results.length} {results.length === 1 ? 'resultado' : 'resultados'}
              </p>
            )}
          </div>
        )}

        {/* Browse mode: flat list */}
        {isBrowse && (
          <>
            {isLoading && (
              <div className="space-y-4">
                <SearchResultSkeleton />
                <SearchResultSkeleton />
                <SearchResultSkeleton />
              </div>
            )}
            {!isLoading && hasSearched && results.length === 0 && (
              <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 text-center">
                <p className="text-gray-500">{t('search.no_results')}</p>
              </div>
            )}
            {!isLoading && results.length > 0 && (
              <div className="space-y-4">
                {results.map((result, index) => (
                  <BrowseResultCard key={result.id} result={result} index={index} />
                ))}
              </div>
            )}
          </>
        )}

        {/* Query / Combined mode: tabbed */}
        {!isBrowse && (
          <>
            <SearchResultsTabs activeTab={activeTab} onTabChange={setActiveTab} />

            <div className={activeTab === 'resposta' ? '' : 'hidden'}>
              <AnswerTab
                query={query}
                results={articleResults}
                isLoading={isLoading}
              />
            </div>

            {activeTab === 'links' && (
              <LinksTab
                results={articleResults}
                query={query}
                isLoading={isLoading}
                hasSearched={hasSearched}
              />
            )}

            {activeTab === 'ebooks' && (
              <EbooksTab
                query={query}
                isLoading={isLoading}
                browseResults={ebookResults}
                hasSearched={hasSearched}
              />
            )}

            {activeTab === 'axway' && (
              <AxwayTab query={query} />
            )}
          </>
        )}
      </div>
    </div>
  );
}
