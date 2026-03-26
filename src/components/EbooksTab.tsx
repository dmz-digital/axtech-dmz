import { useState, useEffect } from 'react';
import { BookOpen, Download, Search } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { EbookSkeleton } from './Skeleton';
import EbookLeadModal from './EbookLeadModal';

interface EbookResult {
  id: string;
  slug: string;
  content_type: string;
  category: string;
  image_url: string;
  title: string;
  summary: string;
  tags: string[];
  rank: number;
  created_at: string;
}

interface EbooksTabProps {
  query: string;
  isLoading: boolean;
  browseResults?: EbookResult[];
  hasSearched?: boolean;
}

export default function EbooksTab({ query, isLoading: parentLoading, browseResults, hasSearched: parentHasSearched }: EbooksTabProps) {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [ebooks, setEbooks] = useState<EbookResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedEbook, setSelectedEbook] = useState<EbookResult | null>(null);

  useEffect(() => {
    if (browseResults !== undefined) {
      setEbooks(browseResults);
      setHasSearched(parentHasSearched ?? false);
      return;
    }

    if (!query || parentLoading) return;

    const searchEbooks = async () => {
      setLoading(true);
      try {
        const lang = i18n.language.startsWith('pt') ? 'pt' : 'en';
        const params = new URLSearchParams({
          query,
          language: lang,
          content_type: 'ebook',
          limit: '10',
        });

        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/search-articles?${params}`,
          {
            headers: {
              Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          setEbooks(data.results || []);
        }
      } catch (err) {
        console.error('Error searching ebooks:', err);
      } finally {
        setLoading(false);
        setHasSearched(true);
      }
    };

    searchEbooks();
  }, [query, parentLoading, browseResults, parentHasSearched, i18n.language]);

  if (parentLoading || loading) {
    return (
      <div className="space-y-4">
        <EbookSkeleton />
        <EbookSkeleton />
      </div>
    );
  }

  if (hasSearched && ebooks.length === 0) {
    return (
      <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Search className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          {t('ebook.no_ebooks')}
        </h3>
        <p className="text-gray-500 text-sm mb-6">
          Nenhum e-book encontrado para "{query}".
        </p>
        <button
          onClick={() => navigate('/ebooks')}
          className="inline-flex items-center gap-2 px-6 py-3 bg-teal-700 hover:bg-teal-800 text-white font-medium rounded-xl transition-colors"
        >
          <BookOpen className="w-5 h-5" />
          Ver todos os e-books
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 text-teal-700">
          <BookOpen className="w-5 h-5" />
          <span className="font-medium">
            {ebooks.length} e-book{ebooks.length !== 1 ? 's' : ''} encontrado{ebooks.length !== 1 ? 's' : ''}
          </span>
        </div>
        <button
          onClick={() => navigate('/ebooks')}
          className="text-sm text-teal-700 hover:text-teal-800 font-medium"
        >
          Ver todos
        </button>
      </div>

      {ebooks.map((ebook) => (
        <div
          key={ebook.id}
          className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
        >
          <div className="flex gap-5">
            <div
              className="w-24 h-32 flex-shrink-0 rounded-lg overflow-hidden cursor-pointer"
              onClick={() => navigate(`/ebook/${ebook.slug}`)}
            >
              <img
                src={ebook.image_url}
                alt={ebook.title}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-0.5 bg-teal-50 text-teal-700 text-xs font-medium rounded capitalize">
                  {ebook.category}
                </span>
              </div>

              <h3
                className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 cursor-pointer hover:text-teal-700 transition-colors"
                onClick={() => navigate(`/ebook/${ebook.slug}`)}
              >
                {ebook.title}
              </h3>

              <p className="text-gray-600 text-sm line-clamp-2 mb-4">
                {ebook.summary}
              </p>

              <button
                onClick={() => setSelectedEbook(ebook)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white text-sm font-medium rounded-lg transition-colors"
              >
                <Download className="w-4 h-4" />
                {t('ebook.download_free')}
              </button>
            </div>
          </div>
        </div>
      ))}

      {selectedEbook && (
        <EbookLeadModal
          isOpen={!!selectedEbook}
          onClose={() => setSelectedEbook(null)}
          ebookId={selectedEbook.id}
          ebookTitle={selectedEbook.title}
          ebookCover={selectedEbook.image_url}
        />
      )}
    </div>
  );
}
