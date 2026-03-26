import { Book, Building2, Heart, Stethoscope, Car, ChevronLeft, ChevronRight, Clock, Zap, Landmark, Building, Package, Truck, ShoppingCart } from 'lucide-react';
import { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation } from 'react-router-dom';

export default function CategoryTabs() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeCategory, setActiveCategory] = useState('ultimas');
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const categories = [
    { id: 'ultimas', labelKey: 'categories.latest', icon: Clock },
    { id: 'ebooks', labelKey: 'categories.ebooks', icon: Book },
    { id: 'banking', labelKey: 'categories.banking', icon: Building2 },
    { id: 'life-science', labelKey: 'categories.life_science', icon: Heart },
    { id: 'healthcare', labelKey: 'categories.healthcare', icon: Stethoscope },
    { id: 'automotivo', labelKey: 'categories.automotive', icon: Car },
    { id: 'energia', labelKey: 'categories.energy', icon: Zap },
    { id: 'governo', labelKey: 'categories.government', icon: Landmark },
    { id: 'setor-publico', labelKey: 'categories.public_sector', icon: Building },
    { id: 'manufatura', labelKey: 'categories.manufacturing', icon: Package },
    { id: 'transporte', labelKey: 'categories.transport', icon: Truck },
    { id: 'varejo', labelKey: 'categories.retail', icon: ShoppingCart },
  ];

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 300;
      const newScrollLeft = direction === 'left'
        ? scrollContainerRef.current.scrollLeft - scrollAmount
        : scrollContainerRef.current.scrollLeft + scrollAmount;

      scrollContainerRef.current.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth'
      });
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollContainerRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - scrollContainerRef.current.offsetLeft);
    setScrollLeft(scrollContainerRef.current.scrollLeft);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollContainerRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollContainerRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    scrollContainerRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!scrollContainerRef.current) return;
    setIsDragging(true);
    setStartX(e.touches[0].pageX - scrollContainerRef.current.offsetLeft);
    setScrollLeft(scrollContainerRef.current.scrollLeft);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !scrollContainerRef.current) return;
    const x = e.touches[0].pageX - scrollContainerRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    scrollContainerRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  return (
    <div className="border-t border-gray-200 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between py-4">
          <button
            onClick={() => scroll('left')}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0"
            aria-label="Previous categories"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>

          <div
            ref={scrollContainerRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseLeave}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            className={`flex items-center space-x-8 overflow-x-auto scrollbar-hide ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {categories.map((category) => {
              const Icon = category.icon;
              const handleClick = () => {
                if (category.id === 'ebooks') {
                  navigate('/ebooks');
                } else if (category.id === 'ultimas') {
                  if (location.pathname === '/') {
                    const el = document.getElementById('latest');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  } else {
                    navigate('/#latest');
                  }
                  setActiveCategory(category.id);
                } else {
                  navigate(`/results?category=${category.id}`);
                  setActiveCategory(category.id);
                }
              };
              return (
                <button
                  key={category.id}
                  onClick={handleClick}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg whitespace-nowrap transition-all flex-shrink-0 ${
                    activeCategory === category.id
                      ? 'text-teal-700 bg-teal-50 font-medium'
                      : 'text-gray-600 hover:text-teal-700 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{t(category.labelKey)}</span>
                </button>
              );
            })}
          </div>

          <button
            onClick={() => scroll('right')}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0"
            aria-label="Next categories"
          >
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>
    </div>
  );
}
