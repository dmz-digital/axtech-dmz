import { useState, useRef, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useArticles, ArticleListItem } from '../hooks/useArticles';
import { useEdicaoEspecial } from '../hooks/useEdicaoEspecial';
import { FeaturedArticleSkeleton, QuickReadSkeleton, ArticleCardSkeleton } from './Skeleton';

interface Article {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  imageUrl?: string;
  tags: string[];
}

const TAG_COLORS = [
  'bg-blue-50 text-blue-500',
  'bg-teal-50 text-teal-600',
  'bg-red-50 text-red-500',
  'bg-cyan-50 text-cyan-600',
  'bg-orange-50 text-orange-500',
];

const stockImages = [
  'https://images.pexels.com/photos/7688336/pexels-photo-7688336.jpeg?auto=compress&cs=tinysrgb&w=1200',
  'https://images.pexels.com/photos/3183197/pexels-photo-3183197.jpeg?auto=compress&cs=tinysrgb&w=600',
  'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=600',
  'https://images.pexels.com/photos/3184325/pexels-photo-3184325.jpeg?auto=compress&cs=tinysrgb&w=600',
  'https://images.pexels.com/photos/3184339/pexels-photo-3184339.jpeg?auto=compress&cs=tinysrgb&w=600',
  'https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg?auto=compress&cs=tinysrgb&w=600',
  'https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg?auto=compress&cs=tinysrgb&w=600',
  'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=600',
  'https://images.pexels.com/photos/3861959/pexels-photo-3861959.jpeg?auto=compress&cs=tinysrgb&w=600',
  'https://images.pexels.com/photos/3861964/pexels-photo-3861964.jpeg?auto=compress&cs=tinysrgb&w=600',
  'https://images.pexels.com/photos/3861972/pexels-photo-3861972.jpeg?auto=compress&cs=tinysrgb&w=600',
  'https://images.pexels.com/photos/3861976/pexels-photo-3861976.jpeg?auto=compress&cs=tinysrgb&w=600',
];

export default function LatestPublications() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { ebook: edicaoEspecial } = useEdicaoEspecial();
  const [currentPage, setCurrentPage] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const lang = i18n.language.startsWith('pt') ? 'pt' : 'en';
  const { articles: rawArticles, isLoading } = useArticles({ language: lang, limit: 20 });

  const allArticles = useMemo<Article[]>(() => {
    return rawArticles.map((article: ArticleListItem, index: number) => ({
      id: article.id,
      slug: article.slug,
      title: article.title,
      excerpt: article.summary,
      imageUrl: article.image_url || stockImages[index % stockImages.length],
      tags: article.tags.slice(0, 2),
    }));
  }, [rawArticles]);

  const featuredArticle = allArticles[0];
  const quickReadArticles = allArticles.slice(1, 5);
  const sliderArticles = allArticles.slice(5);

  const itemsPerPage = 6;
  const totalPages = Math.ceil(sliderArticles.length / itemsPerPage);

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const scrollLeft = scrollContainerRef.current.scrollLeft;
      const containerWidth = scrollContainerRef.current.offsetWidth;
      const page = Math.round(scrollLeft / containerWidth);
      setCurrentPage(page);
    }
  };

  const scrollToPage = (page: number) => {
    if (scrollContainerRef.current) {
      const containerWidth = scrollContainerRef.current.offsetWidth;
      scrollContainerRef.current.scrollTo({
        left: page * containerWidth,
        behavior: 'smooth'
      });
    }
  };

  if (isLoading) {
    return (
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-dark-teal mb-12">{t('latest.title')}</h2>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-5">
              <FeaturedArticleSkeleton />
            </div>
            <div className="lg:col-span-4">
              <div className="h-8 w-40 bg-gray-200 rounded animate-pulse mb-6" />
              <div className="space-y-6">
                {[1, 2, 3, 4].map((i) => (
                  <QuickReadSkeleton key={i} />
                ))}
              </div>
            </div>
            <div className="lg:col-span-3">
              <div className="bg-gray-200 rounded-3xl aspect-[3/4] animate-pulse" />
            </div>
          </div>
          <div className="mt-20 grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-6 md:gap-y-[60px]">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <ArticleCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!featuredArticle) {
    return null;
  }

  return (
    <section id="latest" className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-4xl font-bold text-dark-teal mb-12">{t('latest.title')}</h2>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-5">
            <article className="group">
              <div
                className="relative overflow-hidden rounded-3xl mb-6 aspect-[4/3] cursor-pointer"
                onClick={() => navigate(`/artigo/${featuredArticle.slug}`)}
              >
                <img
                  src={featuredArticle.imageUrl}
                  alt={featuredArticle.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>

              <h3
                className="text-2xl font-bold text-gray-900 mb-4 cursor-pointer hover:text-dark-teal transition-colors"
                onClick={() => navigate(`/artigo/${featuredArticle.slug}`)}
              >
                {featuredArticle.title}
              </h3>

              <p
                className="text-gray-600 mb-6 leading-relaxed cursor-pointer hover:text-gray-800 transition-colors"
                onClick={() => navigate(`/artigo/${featuredArticle.slug}`)}
              >
                {featuredArticle.excerpt}
              </p>

              <div className="flex flex-wrap gap-2">
                {featuredArticle.tags.map((tag, index) => (
                  <button
                    key={index}
                    onClick={() => navigate(`/results?tag=${encodeURIComponent(tag)}`)}
                    className={`px-3 py-1 rounded-full text-sm font-light hover:opacity-80 transition-opacity ${TAG_COLORS[index % TAG_COLORS.length]}`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </article>
          </div>

          <div className="lg:col-span-4">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6">{t('latest.quick_read')}</h3>

              <div className="space-y-6">
                {quickReadArticles.map((article) => (
                  <article
                    key={article.id}
                    className="group pb-6 border-b border-gray-200 last:border-0"
                  >
                    <h4
                      className="text-lg font-semibold text-dark-teal mb-3 cursor-pointer hover:text-teal transition-colors leading-snug"
                      onClick={() => navigate(`/artigo/${article.slug}`)}
                    >
                      {article.title}
                    </h4>

                    <div className="flex flex-wrap gap-2">
                      {article.tags.map((tag, index) => (
                        <button
                          key={index}
                          onClick={() => navigate(`/results?tag=${encodeURIComponent(tag)}`)}
                          className={`px-3 py-1 rounded-full text-xs font-light hover:opacity-80 transition-opacity ${TAG_COLORS[index % TAG_COLORS.length]}`}
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>

          {edicaoEspecial && (
            <div className="lg:col-span-3">
              <div className="sticky top-8">
                <img
                  src={edicaoEspecial.cover_image_path}
                  alt="Edição Especial"
                  className="w-full rounded-3xl cursor-pointer hover:shadow-xl transition-shadow"
                  onClick={() => navigate(`/ebook/${edicaoEspecial.slug}`)}
                />
              </div>
            </div>
          )}
        </div>

        {sliderArticles.length > 0 && (
          <div className="mt-20">
            <div
              ref={scrollContainerRef}
              onScroll={handleScroll}
              className="overflow-x-auto scrollbar-hide snap-x snap-mandatory"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              <div className="flex">
                {Array.from({ length: totalPages }).map((_, pageIndex) => (
                  <div
                    key={pageIndex}
                    className="min-w-full snap-start"
                  >
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-6 md:gap-y-[60px]">
                      {sliderArticles
                        .slice(pageIndex * itemsPerPage, (pageIndex + 1) * itemsPerPage)
                        .map((article) => (
                          <article key={article.id} className="group">
                            <div
                              className="relative overflow-hidden rounded-2xl mb-4 aspect-[4/3] cursor-pointer"
                              onClick={() => navigate(`/artigo/${article.slug}`)}
                            >
                              <img
                                src={article.imageUrl}
                                alt={article.title}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                              />
                            </div>

                            <h3
                              className="text-lg font-semibold text-gray-900 mb-3 leading-snug cursor-pointer hover:text-dark-teal transition-colors"
                              onClick={() => navigate(`/artigo/${article.slug}`)}
                            >
                              {article.title}
                            </h3>

                            <div className="flex flex-wrap gap-2">
                              {article.tags.map((tag, index) => (
                                <button
                                  key={index}
                                  onClick={() => navigate(`/results?tag=${encodeURIComponent(tag)}`)}
                                  className={`px-3 py-1 rounded-full text-xs font-light hover:opacity-80 transition-opacity ${TAG_COLORS[index % TAG_COLORS.length]}`}
                                >
                                  {tag}
                                </button>
                              ))}
                            </div>
                          </article>
                        ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-8">
                {Array.from({ length: totalPages }).map((_, index) => (
                  <button
                    key={index}
                    onClick={() => scrollToPage(index)}
                    className={`w-3 h-3 rounded-full transition-colors ${
                      currentPage === index
                        ? 'bg-dark-teal'
                        : 'bg-gray-300 hover:bg-gray-400'
                    }`}
                    aria-label={t('latest.page', { page: index + 1 })}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
