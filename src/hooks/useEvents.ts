import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

interface EventData {
  title_pt?: string;
  title_en?: string;
  title_es?: string;
  description_pt?: string;
  description_en?: string;
  description_es?: string;
}

interface Event {
  id: string;
  slug: string;
  event_date: string;
  event_time: string | null;
  location: string | null;
  location_type: 'online' | 'presencial';
  image_url: string | null;
  registration_url: string | null;
  data: EventData;
}

interface UseEventsOptions {
  upcoming?: boolean;
  limit?: number;
}

export function useEvents(options: UseEventsOptions = {}) {
  const { upcoming = false, limit = 10 } = options;
  const { i18n } = useTranslation();
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
        const lang = i18n.language || 'pt';
        const params = new URLSearchParams({
          lang,
          limit: String(limit),
          upcoming: String(upcoming),
        });
        const response = await fetch(
          `${supabaseUrl}/functions/v1/list-events?${params}`,
          { headers: { Authorization: `Bearer ${supabaseKey}`, apikey: supabaseKey } }
        );

        if (!response.ok) {
          throw new Error('Failed to fetch events');
        }

        const result = await response.json();
        const rawEvents = result.events || [];

        const normalized: Event[] = rawEvents.map((e: Record<string, unknown>) => ({
          id: e.id,
          slug: e.slug,
          event_date: e.event_date,
          event_time: e.event_time ?? null,
          location: e.location ?? null,
          location_type: e.location_type ?? 'presencial',
          image_url: e.image_url ?? null,
          registration_url: e.registration_url ?? null,
          data: {
            title_pt: (e.data as EventData)?.title_pt ?? (e as Record<string, unknown>).title as string ?? '',
            title_en: (e.data as EventData)?.title_en ?? '',
            title_es: (e.data as EventData)?.title_es ?? '',
            description_pt: (e.data as EventData)?.description_pt ?? (e as Record<string, unknown>).description as string ?? '',
            description_en: (e.data as EventData)?.description_en ?? '',
            description_es: (e.data as EventData)?.description_es ?? '',
          },
        }));

        setEvents(normalized);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, [upcoming, limit, i18n.language]);

  return { events, isLoading, error };
}
