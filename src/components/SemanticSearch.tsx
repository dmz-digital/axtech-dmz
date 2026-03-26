import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowRight, Check, Loader2 } from 'lucide-react';
import { useSemanticSearch } from '../hooks/useSemanticSearch';
import ContentHighlight from './ContentHighlight';

interface SemanticSearchProps {
  onSearch: (query: string) => void;
  initialQuery?: string;
}

export default function SemanticSearch({ onSearch, initialQuery = '' }: SemanticSearchProps) {
  const { t } = useTranslation();
  const [activeMode, setActiveMode] = useState<'axway' | 'content'>('axway');
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const { isModelReady } = useSemanticSearch();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim() && isModelReady) {
      onSearch(searchQuery.trim());
    }
  };

  const axwayActiveClass = 'bg-teal-600 text-white shadow-lg';
  const contentActiveClass = 'bg-[#C0C0C0] text-gray-800 shadow-lg';
  const inactiveClass = 'text-white hover:text-gray-200';

  return (
    <section className="py-16" style={{ backgroundColor: '#F0F2F5' }}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-4xl md:text-5xl font-bold mb-8" style={{ color: '#1B5E7B' }}>
          {t('search.title')}
        </h2>

        <div
          className="inline-flex rounded-full p-1 mb-12 transition-colors duration-300"
          style={{ backgroundColor: activeMode === 'axway' ? '#1B5E7B' : '#3E4447' }}
        >
          <button
            onClick={() => setActiveMode('axway')}
            className={`px-8 py-3 rounded-full font-medium transition-all ${
              activeMode === 'axway' ? axwayActiveClass : inactiveClass
            }`}
          >
            {t('search.mode_axway')}
          </button>
          <button
            onClick={() => setActiveMode('content')}
            className={`px-8 py-3 rounded-full font-medium transition-all ${
              activeMode === 'content' ? contentActiveClass : inactiveClass
            }`}
          >
            {t('search.mode_content')}
          </button>
        </div>
      </div>

      <div
        className={`transition-opacity duration-300 ${
          activeMode === 'axway' ? 'max-w-4xl' : 'max-w-7xl'
        } mx-auto px-4 sm:px-6 lg:px-8`}
      >
        {activeMode === 'axway' ? (
          <div className="text-center">
            <form onSubmit={handleSubmit} className="relative max-w-3xl mx-auto">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('search.placeholder')}
                disabled={!isModelReady}
                className="w-full px-6 py-5 pr-16 rounded-2xl border border-gray-200 focus:border-teal-600 focus:outline-none text-lg shadow-sm bg-white placeholder:font-light placeholder:text-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <button
                type="submit"
                disabled={!isModelReady || !searchQuery.trim()}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-3 rounded-xl transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: '#E85D4A' }}
                aria-label="Search"
              >
                <ArrowRight className="w-6 h-6 text-white" />
              </button>
            </form>

            <div className="mt-4 flex items-center justify-center gap-2 text-sm">
              {isModelReady ? (
                <>
                  <Check className="w-4 h-4 text-green-600" />
                  <span className="text-green-600">{t('search.model_ready')}</span>
                </>
              ) : (
                <>
                  <Loader2 className="w-4 h-4 text-gray-500 animate-spin" />
                  <span className="text-gray-500">{t('search.loading_model')}</span>
                </>
              )}
            </div>
          </div>
        ) : (
          <ContentHighlight />
        )}
      </div>
    </section>
  );
}
