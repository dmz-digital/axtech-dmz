import { ArrowRight } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import ContentHighlight from './ContentHighlight';

export default function SearchSection() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [activeMode, setActiveMode] = useState<'axway' | 'content'>('axway');
  const [searchQuery, setSearchQuery] = useState('');
  const [inputFocused, setInputFocused] = useState(false);
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [visible, setVisible] = useState(true);
  const intervalRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const phrases = t('search.placeholders', { returnObjects: true }) as string[];

  useEffect(() => {
    const cycle = () => {
      setVisible(false);
      setTimeout(() => {
        setPhraseIndex((i) => (i + 1) % phrases.length);
        setVisible(true);
      }, 450);
    };

    intervalRef.current = setInterval(cycle, 3500);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/results?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <section className="py-16 px-4">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-4xl md:text-5xl font-bold text-dark-teal mb-8">
          {t('search.title')}
        </h2>

        <div
          className="inline-flex rounded-full p-1 mb-12 transition-colors duration-300 relative"
          style={{ backgroundColor: activeMode === 'axway' ? '#1B5E7B' : '#3E4447' }}
        >
          <div
            className="absolute top-1 bottom-1 rounded-full transition-all duration-300 ease-out"
            style={{
              width: 'calc(50% - 4px)',
              left: activeMode === 'axway' ? '4px' : 'calc(50% + 0px)',
              backgroundColor: activeMode === 'axway' ? '#176B87' : '#C0C0C0',
              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
            }}
          />
          <button
            onClick={() => setActiveMode('axway')}
            className={`px-8 py-3 rounded-full font-medium transition-colors duration-300 relative z-10 ${
              activeMode === 'axway' ? 'text-white' : 'text-white hover:text-gray-200'
            }`}
          >
            {t('search.mode_axway')}
          </button>
          <button
            onClick={() => setActiveMode('content')}
            className={`px-8 py-3 rounded-full font-medium transition-colors duration-300 relative z-10 ${
              activeMode === 'content' ? 'text-gray-800' : 'text-white hover:text-gray-200'
            }`}
          >
            {t('search.mode_content')}
          </button>
        </div>

        {activeMode === 'axway' && (
          <div className="transition-opacity duration-300">
            <form onSubmit={handleSearch} className="relative max-w-3xl mx-auto">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setInputFocused(true)}
                onBlur={() => setInputFocused(false)}
                className="w-full px-6 py-5 pr-16 rounded-2xl border border-gray-200 focus:border-teal-600 focus:outline-none text-lg shadow-sm"
              />
              {!searchQuery && !inputFocused && (
                <span
                  className="absolute left-6 top-1/2 -translate-y-1/2 text-lg font-light text-gray-400 pointer-events-none select-none transition-opacity duration-[420ms]"
                  style={{ opacity: visible ? 1 : 0 }}
                >
                  {phrases[phraseIndex]}
                </span>
              )}
              <button
                type="submit"
                disabled={!searchQuery.trim()}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-red hover:bg-red/90 text-white p-3 rounded-xl transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Search"
              >
                <ArrowRight className="w-6 h-6" />
              </button>
            </form>
          </div>
        )}
      </div>

      {activeMode === 'content' && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 transition-opacity duration-300">
          <ContentHighlight />
        </div>
      )}
    </section>
  );
}
