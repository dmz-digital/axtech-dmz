import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useArticlesByCategory } from '../hooks/useArticlesByCategory';

const FALLBACK_IMAGE = 'https://images.pexels.com/photos/1181406/pexels-photo-1181406.jpeg?auto=compress&cs=tinysrgb&w=800';

export default function IndustrySection() {
  const navigate = useNavigate();
  const { articles, isLoading } = useArticlesByCategory('banking', 6);

  if (isLoading) {
    return (
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
        </div>
      </section>
    );
  }

  if (articles.length === 0) return null;

  const featured = articles.slice(0, 2);
  const more = articles.slice(2);

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-dark-teal mb-10">Banking e Financial Services</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {featured.map((article) => (
            <article key={article.id} className="group">
              <div
                className="rounded-2xl overflow-hidden mb-5 aspect-[16/10] bg-gray-100 cursor-pointer"
                onClick={() => navigate(`/artigo/${article.slug}`)}
              >
                <img
                  src={article.image_url || FALLBACK_IMAGE}
                  alt={article.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <h3
                className="text-xl font-bold text-gray-900 mb-3 cursor-pointer hover:text-dark-teal transition-colors"
                onClick={() => navigate(`/artigo/${article.slug}`)}
              >
                {article.title}
              </h3>
              <p
                className="text-gray-500 text-sm leading-relaxed mb-4 font-light line-clamp-3 cursor-pointer hover:text-gray-700 transition-colors"
                onClick={() => navigate(`/artigo/${article.slug}`)}
              >
                {article.summary}
              </p>
              <div className="flex flex-wrap gap-2">
                {article.tags.slice(0, 2).map((tag, i) => (
                  <button
                    key={i}
                    onClick={() => navigate(`/results?tag=${encodeURIComponent(tag)}`)}
                    className="px-3 py-1 rounded-full text-xs font-medium bg-teal-50 text-teal-700 border border-teal-200 hover:bg-teal-100 transition-colors"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </article>
          ))}
        </div>

        {more.length > 0 && (
          <div>
            <h3 className="text-base font-semibold text-gray-700 mb-6">Mais conteúdos</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {more.map((item) => (
                <div key={item.id} className="pl-4 border-l-2 border-dark-teal group">
                  <h4
                    className="text-sm font-semibold text-dark-teal mb-2 cursor-pointer hover:text-teal-700 transition-colors line-clamp-2"
                    onClick={() => navigate(`/artigo/${item.slug}`)}
                  >
                    {item.title}
                  </h4>
                  {item.tags[0] && (
                    <button
                      onClick={() => navigate(`/results?tag=${encodeURIComponent(item.tags[0])}`)}
                      className="inline-block px-3 py-1 rounded-full text-xs font-light bg-teal-50 text-teal-600 border border-teal-100 hover:bg-teal-100 transition-colors"
                    >
                      {item.tags[0]}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
