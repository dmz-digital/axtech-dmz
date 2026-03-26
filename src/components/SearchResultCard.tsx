import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import type { SearchResult } from '../hooks/useSemanticSearch';

const TAG_COLORS = [
  'bg-blue-50 text-blue-500',
  'bg-teal-50 text-teal-600',
  'bg-red-50 text-red-500',
  'bg-cyan-50 text-cyan-600',
  'bg-orange-50 text-orange-500',
];

const CATEGORY_THUMBNAILS: Record<string, string> = {
  banking: 'https://images.pexels.com/photos/4386321/pexels-photo-4386321.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop',
  'life-science': 'https://images.pexels.com/photos/2280571/pexels-photo-2280571.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop',
  healthcare: 'https://images.pexels.com/photos/3825586/pexels-photo-3825586.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop',
  default: 'https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop',
};

function getCategoryThumbnail(category: string): string {
  const key = category.toLowerCase().replace(/\s+/g, '-');
  return CATEGORY_THUMBNAILS[key] || CATEGORY_THUMBNAILS.default;
}

interface SearchResultCardProps {
  result: SearchResult;
  index: number;
}

export default function SearchResultCard({ result, index }: SearchResultCardProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const scorePercent = Math.round(result.score * 100);
  const thumbnail = result.image_url || getCategoryThumbnail(result.category);

  const goToArticle = () => {
    const path = result.content_type === 'ebook' ? `/ebook/${result.slug}` : `/artigo/${result.slug}`;
    navigate(path);
  };

  return (
    <div
      className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow overflow-hidden flex"
      style={{ animation: `fadeSlideUp 0.4s ease-out ${index * 0.1}s both` }}
    >
      <div
        className="w-32 sm:w-44 flex-shrink-0 relative overflow-hidden cursor-pointer"
        onClick={goToArticle}
      >
        <img
          src={thumbnail}
          alt={result.category}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          style={{ minHeight: '100%' }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/5" />
      </div>

      <div className="flex-1 p-5 min-w-0">
        <div className="flex items-start justify-between gap-4 mb-2">
          <h3
            className="text-lg font-semibold text-gray-900 leading-snug cursor-pointer hover:text-teal-700 transition-colors"
            onClick={goToArticle}
          >
            {result.title}
          </h3>
          <button
            onClick={() => navigate(`/results?category=${encodeURIComponent(result.category)}`)}
            className="px-3 py-1 rounded-full text-xs font-light capitalize flex-shrink-0 bg-teal-50 text-teal-600 hover:bg-teal-100 transition-colors"
          >
            {result.category}
          </button>
        </div>

        <p
          className="text-gray-600 mb-3 text-sm line-clamp-2 cursor-pointer hover:text-gray-800 transition-colors"
          onClick={goToArticle}
        >
          {result.summary}
        </p>

        <div className="flex flex-wrap gap-1.5 mb-3">
          {result.tags.map((tag, tagIndex) => (
            <button
              key={tag}
              onClick={() => navigate(`/results?tag=${encodeURIComponent(tag)}`)}
              className={`px-3 py-0.5 rounded-full text-xs font-light hover:opacity-80 transition-opacity ${TAG_COLORS[tagIndex % TAG_COLORS.length]}`}
            >
              {tag}
            </button>
          ))}
        </div>

      </div>

      <style>{`
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
