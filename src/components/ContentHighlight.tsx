import { useState, useEffect, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Loader2 } from 'lucide-react';
import { useArticles, ArticleListItem } from '../hooks/useArticles';

const HIGHLIGHT_IMAGES = [
  'https://images.pexels.com/photos/7688336/pexels-photo-7688336.jpeg?auto=compress&cs=tinysrgb&w=1200',
  'https://images.pexels.com/photos/3183197/pexels-photo-3183197.jpeg?auto=compress&cs=tinysrgb&w=1200',
  'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=1200',
  'https://images.pexels.com/photos/3184325/pexels-photo-3184325.jpeg?auto=compress&cs=tinysrgb&w=1200',
  'https://images.pexels.com/photos/3861959/pexels-photo-3861959.jpeg?auto=compress&cs=tinysrgb&w=1200',
];

const TAG_COLORS = [
  'bg-blue-50 text-blue-600 border border-blue-100',
  'bg-teal-50 text-teal-700 border border-teal-100',
  'bg-red-50 text-red-500 border border-red-100',
  'bg-cyan-50 text-cyan-600 border border-cyan-100',
  'bg-orange-50 text-orange-500 border border-orange-100',
];

export default function ContentHighlight() {
  const { i18n } = useTranslation();
  const [activeIndex, setActiveIndex] = useState(0);
  const [transitioning, setTransitioning] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const startX = useRef<number | null>(null);
  const endX = useRef<number | null>(null);

  const lang = i18n.language.startsWith('pt') ? 'pt' : 'en';
  const { articles: rawArticles, isLoading } = useArticles({ language: lang, limit: 5 });

  const highlights = useMemo(() => {
    return rawArticles.map((article: ArticleListItem, index: number) => ({
      id: article.id,
      title: article.title,
      summary: article.summary,
      tags: article.tags.slice(0, 2),
      imageUrl: article.image_url || HIGHLIGHT_IMAGES[index % HIGHLIGHT_IMAGES.length],
    }));
  }, [rawArticles]);

  useEffect(() => {
    if (highlights.length === 0) return;

    const timer = setInterval(() => {
      if (!transitioning) {
        setTransitioning(true);
        setTimeout(() => {
          setActiveIndex((i) => (i + 1) % highlights.length);
          setTransitioning(false);
        }, 300);
      }
    }, 5000);
    return () => clearInterval(timer);
  }, [transitioning, highlights.length]);

  const handleDot = (index: number) => {
    if (transitioning || index === activeIndex) return;
    setTransitioning(true);
    setTimeout(() => {
      setActiveIndex(index);
      setTransitioning(false);
    }, 300);
  };

  const goToSlide = (direction: 'next' | 'prev') => {
    if (transitioning || highlights.length === 0) return;
    setTransitioning(true);
    setTimeout(() => {
      setActiveIndex((i) => {
        if (direction === 'next') {
          return (i + 1) % highlights.length;
        } else {
          return i === 0 ? highlights.length - 1 : i - 1;
        }
      });
      setTransitioning(false);
    }, 300);
  };

  const handleSwipeEnd = () => {
    if (startX.current === null || endX.current === null) return;
    const diff = startX.current - endX.current;
    const minSwipeDistance = 50;

    if (Math.abs(diff) > minSwipeDistance) {
      if (diff > 0) {
        goToSlide('next');
      } else {
        goToSlide('prev');
      }
    }

    startX.current = null;
    endX.current = null;
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    endX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    handleSwipeEnd();
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    startX.current = e.clientX;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    endX.current = e.clientX;
  };

  const handleMouseUp = () => {
    if (!isDragging) return;
    setIsDragging(false);
    handleSwipeEnd();
  };

  const handleMouseLeave = () => {
    if (isDragging) {
      setIsDragging(false);
      handleSwipeEnd();
    }
  };

  if (isLoading) {
    return (
      <div className="w-full flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
      </div>
    );
  }

  if (highlights.length === 0) {
    return null;
  }

  const article = highlights[activeIndex];

  return (
    <div
      className="w-full cursor-grab active:cursor-grabbing select-none"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
    >
      <div
        className="grid grid-cols-2"
        style={{
          transition: 'opacity 0.3s ease',
          opacity: transitioning ? 0 : 1,
        }}
      >
        <div className="overflow-hidden rounded-2xl">
          <img
            src={article.imageUrl}
            alt={article.title}
            className="w-full h-full object-cover pointer-events-none"
            style={{ aspectRatio: '4/3' }}
            draggable={false}
          />
        </div>

        <div className="flex flex-col justify-center text-left px-12 py-8">
          <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 leading-snug">
            {article.title}
          </h3>
          <p className="text-gray-500 text-base leading-relaxed mb-6 font-light">
            {article.summary}
          </p>
          <div className="flex flex-wrap gap-2">
            {article.tags.map((tag, i) => (
              <span
                key={i}
                className={`px-3 py-1 rounded-full text-sm font-light ${TAG_COLORS[i % TAG_COLORS.length]}`}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="flex justify-center gap-2 mt-6">
        {highlights.map((_, index) => (
          <button
            key={index}
            onClick={() => handleDot(index)}
            className="transition-all duration-300 rounded-full"
            style={{
              width: activeIndex === index ? '24px' : '10px',
              height: '10px',
              backgroundColor: activeIndex === index ? '#1B5E7B' : '#CBD5E1',
            }}
            aria-label={`Slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
