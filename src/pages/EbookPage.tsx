import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Download, Tag, Calendar, Users } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useEbook, useEbooks } from '../hooks/useEbooks';
import EbookLeadModal from '../components/EbookLeadModal';

function RelatedEbookCard({ ebook, onClick }: { ebook: { id: string; slug: string; title: string; cover_image_url: string }; onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      className="flex gap-4 p-4 bg-white rounded-xl border border-gray-100 hover:shadow-md transition-all cursor-pointer group"
    >
      <img
        src={ebook.cover_image_url}
        alt={ebook.title}
        className="w-20 h-28 object-cover rounded-lg flex-shrink-0"
      />
      <div className="flex flex-col justify-center">
        <h4 className="font-medium text-gray-900 line-clamp-2 group-hover:text-teal-700 transition-colors">
          {ebook.title}
        </h4>
      </div>
    </div>
  );
}

export default function EbookPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { ebook, loading, error } = useEbook(slug);
  const { ebooks: relatedEbooks } = useEbooks();
  const [showModal, setShowModal] = useState(false);

  const otherEbooks = relatedEbooks.filter((e) => e.slug !== slug).slice(0, 3);

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="animate-pulse space-y-8">
            <div className="h-8 w-32 bg-gray-200 rounded" />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div className="aspect-[3/4] bg-gray-200 rounded-2xl" />
              <div className="space-y-6">
                <div className="h-10 bg-gray-200 rounded w-3/4" />
                <div className="h-6 bg-gray-200 rounded w-1/2" />
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 rounded" />
                  <div className="h-4 bg-gray-200 rounded" />
                  <div className="h-4 bg-gray-200 rounded w-4/5" />
                </div>
                <div className="h-14 bg-gray-200 rounded-xl w-48" />
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (error || !ebook) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {t('ebook.not_found')}
          </h2>
          <button
            onClick={() => navigate('/ebooks')}
            className="text-teal-700 hover:text-teal-800 font-medium"
          >
            {t('ebook.back_to_ebooks')}
          </button>
        </div>
      </main>
    );
  }

  const formattedDate = new Date(ebook.created_at).toLocaleDateString(
    undefined,
    { year: 'numeric', month: 'long' }
  );

  return (
    <main className="min-h-screen bg-gray-50">
      <section className="py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
            <div className="relative">
              <div className="sticky top-8">
                <div className="bg-gradient-to-br from-teal-700 to-teal-900 rounded-3xl p-8 md:p-12 flex items-center justify-center">
                  <img
                    src={ebook.cover_image_url}
                    alt={ebook.title}
                    className="w-full max-w-xs rounded-xl shadow-2xl"
                  />
                </div>
              </div>
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-3 mb-6">
                <span className="px-4 py-1.5 bg-teal-100 text-teal-800 text-sm font-medium rounded-full capitalize">
                  {ebook.category}
                </span>
                <span className="flex items-center gap-1.5 text-sm text-gray-500">
                  <Calendar className="w-4 h-4" />
                  {formattedDate}
                </span>
                {ebook.download_count > 0 && (
                  <span className="flex items-center gap-1.5 text-sm text-gray-500">
                    <Users className="w-4 h-4" />
                    {ebook.download_count} downloads
                  </span>
                )}
              </div>

              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                {ebook.title}
              </h1>

              <p className="text-gray-600 text-lg leading-relaxed mb-8">
                {ebook.summary}
              </p>

              {ebook.tags && ebook.tags.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 mb-8">
                  <Tag className="w-4 h-4 text-gray-400" />
                  {ebook.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              <button
                onClick={() => setShowModal(true)}
                className="bg-teal-700 hover:bg-teal-800 text-white font-semibold py-4 px-8 rounded-xl transition-colors flex items-center gap-3 text-lg shadow-lg shadow-teal-700/20"
              >
                <Download className="w-6 h-6" />
                {t('ebook.download_free')}
              </button>

              <p className="text-sm text-gray-500 mt-4">
                {t('ebook.download_note')}
              </p>
            </div>
          </div>

          {otherEbooks.length > 0 && (
            <div className="mt-16 pt-16 border-t border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900 mb-8">
                {t('ebook.other_ebooks')}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {otherEbooks.map((relatedEbook) => (
                  <RelatedEbookCard
                    key={relatedEbook.id}
                    ebook={relatedEbook}
                    onClick={() => navigate(`/ebook/${relatedEbook.slug}`)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      <EbookLeadModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        ebookId={ebook.id}
        ebookTitle={ebook.title}
        ebookCover={ebook.cover_image_url}
      />
    </main>
  );
}
