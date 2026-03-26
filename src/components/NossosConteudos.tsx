import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const CARD_DEFS = [
  { id: 1, categoryId: 'banking', labelKey: 'nossos_conteudos.banking_label', descKey: 'nossos_conteudos.banking_description', image: 'https://images.pexels.com/photos/7567443/pexels-photo-7567443.jpeg?auto=compress&cs=tinysrgb&w=800' },
  { id: 2, categoryId: 'life-science', labelKey: 'nossos_conteudos.life_science_label', descKey: 'nossos_conteudos.life_science_description', image: 'https://images.pexels.com/photos/3825527/pexels-photo-3825527.jpeg?auto=compress&cs=tinysrgb&w=800' },
  { id: 3, categoryId: 'healthcare', labelKey: 'nossos_conteudos.healthcare_label', descKey: 'nossos_conteudos.healthcare_description', image: 'https://images.pexels.com/photos/4386467/pexels-photo-4386467.jpeg?auto=compress&cs=tinysrgb&w=800' },
  { id: 4, categoryId: 'automotivo', labelKey: 'nossos_conteudos.automotive_label', descKey: 'nossos_conteudos.automotive_description', image: 'https://images.pexels.com/photos/3972755/pexels-photo-3972755.jpeg?auto=compress&cs=tinysrgb&w=800' },
  { id: 5, categoryId: 'energia', labelKey: 'nossos_conteudos.energy_label', descKey: 'nossos_conteudos.energy_description', image: 'https://images.pexels.com/photos/9875441/pexels-photo-9875441.jpeg?auto=compress&cs=tinysrgb&w=800' },
  { id: 6, categoryId: 'governo', labelKey: 'nossos_conteudos.government_label', descKey: 'nossos_conteudos.government_description', image: 'https://images.pexels.com/photos/1550337/pexels-photo-1550337.jpeg?auto=compress&cs=tinysrgb&w=800' },
  { id: 7, categoryId: 'setor-publico', labelKey: 'nossos_conteudos.public_sector_label', descKey: 'nossos_conteudos.public_sector_description', image: 'https://images.pexels.com/photos/1117452/pexels-photo-1117452.jpeg?auto=compress&cs=tinysrgb&w=800' },
  { id: 8, categoryId: 'manufatura', labelKey: 'nossos_conteudos.manufacturing_label', descKey: 'nossos_conteudos.manufacturing_description', image: 'https://images.pexels.com/photos/1108101/pexels-photo-1108101.jpeg?auto=compress&cs=tinysrgb&w=800' },
  { id: 9, categoryId: 'transporte', labelKey: 'nossos_conteudos.transport_label', descKey: 'nossos_conteudos.transport_description', image: 'https://images.pexels.com/photos/4481326/pexels-photo-4481326.jpeg?auto=compress&cs=tinysrgb&w=800' },
  { id: 10, categoryId: 'varejo', labelKey: 'nossos_conteudos.retail_label', descKey: 'nossos_conteudos.retail_description', image: 'https://images.pexels.com/photos/5632397/pexels-photo-5632397.jpeg?auto=compress&cs=tinysrgb&w=800' },
];

const VISIBLE = 3;

export default function NossosConteudos() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [current, setCurrent] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const dragMoved = useRef(false);

  const total = CARD_DEFS.length;
  const maxIndex = total - VISIBLE;

  const go = (dir: 'prev' | 'next') => {
    setCurrent((c) => {
      if (dir === 'next') return Math.min(c + 1, maxIndex);
      return Math.max(c - 1, 0);
    });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    startX.current = e.clientX;
    dragMoved.current = false;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current) return;
    if (Math.abs(e.clientX - startX.current) > 5) {
      dragMoved.current = true;
    }
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (!isDragging.current) return;
    isDragging.current = false;
    const diff = startX.current - e.clientX;
    if (Math.abs(diff) > 50) {
      go(diff > 0 ? 'next' : 'prev');
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX;
    dragMoved.current = false;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (Math.abs(e.touches[0].clientX - startX.current) > 5) {
      dragMoved.current = true;
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const diff = startX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) go(diff > 0 ? 'next' : 'prev');
  };

  const handleCardClick = (categoryId: string) => {
    if (dragMoved.current) return;
    navigate(`/results?category=${categoryId}`);
  };

  return (
    <section className="py-20 overflow-hidden bg-dark-teal">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-12 items-start">
          <div className="lg:w-72 flex-shrink-0 flex flex-col justify-center self-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-white rounded-full px-4 py-1.5 mb-8">
                <span className="text-sm font-bold text-gray-900">AxTech</span>
                <span className="w-px h-4 bg-gray-300" />
                <span className="text-xs font-medium text-gray-500">Originals</span>
              </div>

              <h2 className="text-4xl font-bold mb-6 text-lightest-teal">
                {t('nossos_conteudos.title')}
              </h2>

              <p className="text-white/80 text-base leading-relaxed">
                {t('nossos_conteudos.description')}
              </p>
            </div>
          </div>

          <div className="flex-1 overflow-hidden relative" ref={trackRef}>
            <div
              className="flex gap-6 transition-transform duration-500 ease-out cursor-grab active:cursor-grabbing select-none"
              style={{ transform: `translateX(calc(-${current * (100 / VISIBLE)}% - ${current * (24 / VISIBLE)}px))` }}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              {CARD_DEFS.map((card) => (
                <div
                  key={card.id}
                  className="flex-shrink-0 group cursor-pointer"
                  style={{ width: `calc(${100 / VISIBLE}% - ${(24 * (VISIBLE - 1)) / VISIBLE}px)` }}
                  onClick={() => handleCardClick(card.categoryId)}
                >
                  <div className="rounded-2xl overflow-hidden mb-5 aspect-[3/4]">
                    <img
                      src={card.image}
                      alt={t(card.labelKey)}
                      className="w-full h-full object-cover pointer-events-none transition-transform duration-500 group-hover:scale-105"
                      draggable={false}
                    />
                  </div>
                  <h3 className="text-lg font-bold mb-2 text-lightest-teal group-hover:text-white transition-colors">
                    {t(card.labelKey)}
                  </h3>
                  <p className="text-white/70 text-sm leading-relaxed">
                    {t(card.descKey)}
                  </p>
                </div>
              ))}
            </div>
            {current < maxIndex && (
              <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-dark-teal to-transparent pointer-events-none" />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
