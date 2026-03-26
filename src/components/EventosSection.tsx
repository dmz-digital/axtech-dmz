import { useState, useMemo } from 'react';
import { MapPin, Share2, Monitor, ExternalLink, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useEvents } from '../hooks/useEvents';
import axwayLogo from '../assets/logo-axway copy.svg';

const VISIBLE = 3;

function formatEventDate(dateStr: string, timeStr: string | null, locale: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  const options: Intl.DateTimeFormatOptions = {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  };

  let formattedDate = date.toLocaleDateString(locale, options).toUpperCase();

  if (timeStr) {
    const [hours, minutes] = timeStr.split(':');
    formattedDate += ` - ÀS ${hours}H${minutes !== '00' ? minutes : ''}`;
  }

  return formattedDate;
}

export default function EventosSection() {
  const { i18n } = useTranslation();
  const { events, isLoading } = useEvents({ upcoming: true, limit: 9 });
  const [current, setCurrent] = useState(0);

  const locale = i18n.language === 'pt' ? 'pt-BR' : i18n.language === 'es' ? 'es-ES' : 'en-US';
  const langKey = i18n.language as 'pt' | 'en' | 'es';

  const displayEvents = useMemo(() => {
    return events.map((event) => ({
      id: event.id,
      date: formatEventDate(event.event_date, event.event_time, locale),
      location: event.location_type === 'online'
        ? 'ONLINE | AO-VIVO'
        : event.location?.toUpperCase() || 'PRESENCIAL',
      locationType: event.location_type,
      title: event.data[`title_${langKey}`] || event.data.title_pt || '',
      description: event.data[`description_${langKey}`] || event.data.description_pt || '',
      registrationUrl: event.registration_url,
    }));
  }, [events, locale, langKey]);

  const maxIndex = Math.max(0, displayEvents.length - VISIBLE);
  const totalDots = maxIndex + 1;

  const startX = { current: 0 };

  const handleTouchStart = (e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const diff = startX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) setCurrent((c) => Math.min(c + 1, maxIndex));
      else setCurrent((c) => Math.max(c - 1, 0));
    }
  };

  const handleShare = async (event: typeof displayEvents[0]) => {
    const shareData = {
      title: event.title,
      text: event.description,
      url: event.registrationUrl || window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {
        /* User cancelled */
      }
    } else if (event.registrationUrl) {
      window.open(event.registrationUrl, '_blank');
    }
  };

  if (isLoading) {
    return (
      <section id="eventos" className="py-20 overflow-hidden" style={{ backgroundColor: '#3E4447' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-white" />
          </div>
        </div>
      </section>
    );
  }

  if (displayEvents.length === 0) {
    return null;
  }

  return (
    <section id="eventos" className="py-20 overflow-hidden" style={{ backgroundColor: '#3E4447' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-12 items-start">
          <div className="lg:w-64 flex-shrink-0 self-center">
            <h2 className="text-4xl font-bold text-white mb-6">Eventos</h2>
            <p className="text-gray-400 text-base leading-relaxed">
              A transformação digital dos sistemas bancários requer velocidade para atender uma demanda poderosa que vem rompendo os modelos antigos pelo novo ecossistema das fintechs.
            </p>
          </div>

          <div className="flex-1 min-w-0">
            <div
              className="overflow-hidden"
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
            >
              <div
                className="flex gap-5 transition-transform duration-500 ease-out items-stretch"
                style={{ transform: `translateX(calc(-${current * (100 / VISIBLE)}% - ${current * (20 / VISIBLE)}px))` }}
              >
                {displayEvents.map((evento) => (
                  <div
                    key={evento.id}
                    className="flex-shrink-0 rounded-2xl overflow-hidden shadow-lg flex flex-col"
                    style={{ width: `calc(${100 / VISIBLE}% - ${(20 * (VISIBLE - 1)) / VISIBLE}px)` }}
                  >
                    <div
                      className="relative p-6 pb-8 flex-1 flex flex-col"
                      style={{ backgroundColor: '#176B87', minHeight: '160px' }}
                    >
                      <div className="mb-auto">
                        <img
                          src={axwayLogo}
                          alt="Axway"
                          className="h-5 brightness-0 invert"
                        />
                      </div>

                      <div className="mt-8">
                        <p className="text-white font-bold text-xs tracking-widest mb-2 uppercase">{evento.date}</p>
                        <div className="flex items-center gap-1.5">
                          {evento.locationType === 'online' ? (
                            <Monitor className="w-3.5 h-3.5 text-teal-300 flex-shrink-0" />
                          ) : (
                            <MapPin className="w-3.5 h-3.5 text-teal-300 flex-shrink-0" />
                          )}
                          <span className="text-teal-300 text-xs font-semibold tracking-widest">{evento.location}</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h3 className="text-sm font-bold text-gray-900 mb-1 uppercase tracking-tight">{evento.title}</h3>
                          <p className="text-gray-500 text-xs leading-relaxed line-clamp-2">{evento.description}</p>
                        </div>
                        <div className="flex-shrink-0 flex gap-2">
                          {evento.registrationUrl && (
                            <a
                              href={evento.registrationUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-teal-700 hover:text-teal-800 transition-colors"
                              title="Inscrever-se"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          )}
                          <button
                            onClick={() => handleShare(evento)}
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                            title="Compartilhar"
                          >
                            <Share2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {totalDots > 1 && (
              <div className="flex justify-center gap-2 mt-8">
                {Array.from({ length: totalDots }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrent(i)}
                    className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                      i === current
                        ? 'bg-white scale-110'
                        : 'bg-white/30 hover:bg-white/60'
                    }`}
                    aria-label={`Página ${i + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
