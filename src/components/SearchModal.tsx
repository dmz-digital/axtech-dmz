import { useEffect, useRef, useState, useCallback } from 'react';
import { Search, X, ArrowRight, FileText, BookOpen, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSemanticSearch, SearchResult } from '../hooks/useSemanticSearch';
import { useTranslation } from 'react-i18next';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const STOCK_IMAGE = 'https://images.pexels.com/photos/3183197/pexels-photo-3183197.jpeg?auto=compress&cs=tinysrgb&w=200';

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { search, isSearching } = useSemanticSearch();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const lang = i18n.language.startsWith('pt') ? 'pt' : 'en';

  const doSearch = useCallback(async (q: string) => {
    if (q.trim().length < 2) {
      setResults([]);
      setHasSearched(false);
      return;
    }
    const res = await search({ query: q, language: lang, limit: 8 });
    setResults(res);
    setHasSearched(true);
  }, [search, lang]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => doSearch(query), 350);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query, doSearch]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      setQuery('');
      setResults([]);
      setHasSearched(false);
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  const goToResult = (result: SearchResult) => {
    onClose();
    if (result.content_type === 'ebook') {
      navigate(`/ebook/${result.slug}`);
    } else {
      navigate(`/artigo/${result.slug}`);
    }
  };

  const goToFullSearch = () => {
    if (query.trim().length < 2) return;
    onClose();
    navigate(`/results?query=${encodeURIComponent(query.trim())}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') goToFullSearch();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-20 px-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden animate-modal-in">
        <div className="flex items-center px-5 py-4 border-b border-gray-100">
          <Search className="w-5 h-5 text-gray-400 shrink-0 mr-3" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t('search.placeholder', 'Buscar artigos, ebooks...')}
            className="flex-1 text-base text-gray-800 placeholder-gray-400 outline-none bg-transparent"
          />
          <div className="flex items-center gap-2 ml-3">
            {isSearching && <Loader2 className="w-4 h-4 text-teal-600 animate-spin" />}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {results.length > 0 && (
          <ul className="max-h-[420px] overflow-y-auto divide-y divide-gray-50">
            {results.map((result) => (
              <li key={result.id}>
                <button
                  onClick={() => goToResult(result)}
                  className="w-full flex items-start gap-4 px-5 py-4 hover:bg-gray-50 transition-colors text-left group"
                >
                  <div className="w-14 h-14 rounded-lg overflow-hidden shrink-0 bg-gray-100">
                    <img
                      src={result.image_url || STOCK_IMAGE}
                      alt={result.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {result.content_type === 'ebook' ? (
                        <BookOpen className="w-3.5 h-3.5 text-teal-500 shrink-0" />
                      ) : (
                        <FileText className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                      )}
                      <span className="text-xs text-gray-400 capitalize">{result.content_type === 'ebook' ? 'Ebook' : 'Artigo'}</span>
                      {result.category && (
                        <>
                          <span className="text-gray-300">·</span>
                          <span className="text-xs text-gray-400 capitalize">{result.category}</span>
                        </>
                      )}
                    </div>
                    <p className="text-sm font-semibold text-gray-800 group-hover:text-teal-700 transition-colors leading-snug line-clamp-1">
                      {result.title}
                    </p>
                    {result.summary && (
                      <p className="text-xs text-gray-500 mt-0.5 line-clamp-2 leading-relaxed">
                        {result.summary}
                      </p>
                    )}
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-teal-500 transition-colors shrink-0 mt-1" />
                </button>
              </li>
            ))}
          </ul>
        )}

        {hasSearched && results.length === 0 && !isSearching && (
          <div className="px-5 py-10 text-center text-gray-400">
            <Search className="w-8 h-8 mx-auto mb-3 text-gray-200" />
            <p className="text-sm">{t('search.no_results', 'Nenhum resultado encontrado para')} <span className="font-medium text-gray-600">"{query}"</span></p>
          </div>
        )}

        {!hasSearched && !isSearching && (
          <div className="px-5 py-6 text-center text-gray-400">
            <p className="text-sm">{t('search.hint', 'Digite ao menos 2 caracteres para buscar')}</p>
          </div>
        )}

        {query.trim().length >= 2 && (
          <div className="border-t border-gray-100 px-5 py-3">
            <button
              onClick={goToFullSearch}
              className="flex items-center gap-2 text-sm text-teal-600 hover:text-teal-800 font-medium transition-colors group"
            >
              <Search className="w-4 h-4" />
              {t('search.see_all', 'Ver todos os resultados para')} <span className="font-semibold">"{query}"</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
