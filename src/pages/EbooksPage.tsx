import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Download, BookOpen } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useEbooks, Ebook } from '../hooks/useEbooks';
import EbookLeadModal from '../components/EbookLeadModal';

function EbookCard({ ebook, onDownload }: { ebook: Ebook; onDownload: (ebook: Ebook) => void }) {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 group">
      <div
        className="aspect-[4/3] overflow-hidden cursor-pointer"
        onClick={() => navigate(`/ebook/${ebook.slug}`)}
      >
        <img
          src={ebook.cover_image_url}
          alt={ebook.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
      </div>

      <div className="p-6">
        <div className="flex items-center gap-2 mb-3">
          <span className="px-3 py-1 bg-teal-50 text-teal-700 text-xs font-medium rounded-full capitalize">
            {ebook.category}
          </span>
          {ebook.download_count > 0 && (
            <span className="text-xs text-gray-400">
              {ebook.download_count} downloads
            </span>
          )}
        </div>

        <h3
          className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 cursor-pointer hover:text-teal-700 transition-colors"
          onClick={() => navigate(`/ebook/${ebook.slug}`)}
        >
          {ebook.title}
        </h3>

        <p className="text-gray-600 text-sm line-clamp-3 mb-4">
          {ebook.summary}
        </p>

        <button
          onClick={() => onDownload(ebook)}
          className="w-full bg-teal-700 hover:bg-teal-800 text-white font-medium py-3 px-4 rounded-xl transition-colors flex items-center justify-center gap-2"
        >
          <Download className="w-4 h-4" />
          {t('ebook.download_free')}
        </button>
      </div>
    </div>
  );
}

function EbookSkeleton() {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-pulse">
      <div className="aspect-[4/3] bg-gray-200" />
      <div className="p-6 space-y-4">
        <div className="flex gap-2">
          <div className="h-6 w-20 bg-gray-200 rounded-full" />
          <div className="h-6 w-16 bg-gray-200 rounded-full" />
        </div>
        <div className="h-6 bg-gray-200 rounded w-full" />
        <div className="h-4 bg-gray-200 rounded w-3/4" />
        <div className="h-4 bg-gray-200 rounded w-full" />
        <div className="h-12 bg-gray-200 rounded-xl" />
      </div>
    </div>
  );
}

export default function EbooksPage() {
  const { t } = useTranslation();
  const { ebooks, loading, error } = useEbooks();
  const [selectedEbook, setSelectedEbook] = useState<Ebook | null>(null);

  return (
    <main className="min-h-screen bg-gray-50">
      <section className="bg-gradient-to-br from-teal-800 via-teal-700 to-teal-900 text-white py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center">
              <BookOpen className="w-7 h-7" />
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold">
              {t('ebook.page_title')}
            </h1>
          </div>

          <p className="text-teal-100 text-lg md:text-xl max-w-2xl">
            {t('ebook.page_subtitle')}
          </p>
        </div>
      </section>

      <section className="py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {error && (
            <div className="bg-red-50 text-red-700 px-6 py-4 rounded-xl mb-8">
              {error}
            </div>
          )}

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <EbookSkeleton key={i} />
              ))}
            </div>
          ) : ebooks.length === 0 ? (
            <div className="text-center py-16">
              <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-gray-600 mb-2">
                {t('ebook.no_ebooks')}
              </h3>
              <p className="text-gray-500">
                {t('ebook.no_ebooks_subtitle')}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {ebooks.map((ebook) => (
                <EbookCard
                  key={ebook.id}
                  ebook={ebook}
                  onDownload={setSelectedEbook}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {selectedEbook && (
        <EbookLeadModal
          isOpen={!!selectedEbook}
          onClose={() => setSelectedEbook(null)}
          ebookId={selectedEbook.id}
          ebookTitle={selectedEbook.title}
          ebookCover={selectedEbook.cover_image_url}
        />
      )}
    </main>
  );
}
