import { useState, useEffect, useCallback } from 'react';
import { supabase, apiUrl, getAuthHeaders } from '../lib/supabase';

interface DashboardStats {
  articles: { total: number; published: number; drafts: number };
  ebooks: { total: number; published: number; drafts: number; totalDownloads: number };
  events: { total: number; upcoming: number; past: number; published: number; drafts: number };
  leads: { ebookLeads: number; newsletterSubscribers: number; total: number };
  recent: {
    articles: unknown[];
    ebooks: unknown[];
    events: unknown[];
    leads: unknown[];
  };
}

export function useDashboardStats() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      setError('Not authenticated');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(apiUrl('admin-dashboard-stats'), {
        headers: getAuthHeaders(session.access_token),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to fetch stats');
      }

      const data = await response.json();
      setStats(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { stats, isLoading, error, refetch: fetchStats };
}

export function useAdminArticles() {
  const [articles, setArticles] = useState<unknown[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchArticles = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      setError('Not authenticated');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(apiUrl('admin-articles'), {
        headers: getAuthHeaders(session.access_token),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to fetch articles');
      }

      const data = await response.json();
      setArticles(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createArticle = async (articleData: unknown) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('Not authenticated');

    const response = await fetch(apiUrl('admin-articles'), {
      method: 'POST',
      headers: getAuthHeaders(session.access_token),
      body: JSON.stringify(articleData),
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Failed to create article');
    }

    return response.json();
  };

  const updateArticle = async (id: string, articleData: unknown) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('Not authenticated');

    const response = await fetch(apiUrl(`admin-articles/${id}`), {
      method: 'PUT',
      headers: getAuthHeaders(session.access_token),
      body: JSON.stringify(articleData),
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Failed to update article');
    }

    return response.json();
  };

  const deleteArticle = async (id: string) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('Not authenticated');

    const response = await fetch(apiUrl(`admin-articles/${id}`), {
      method: 'DELETE',
      headers: getAuthHeaders(session.access_token),
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Failed to delete article');
    }

    return response.json();
  };

  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

  return { articles, isLoading, error, refetch: fetchArticles, createArticle, updateArticle, deleteArticle };
}

export function useAdminEbooks() {
  const [ebooks, setEbooks] = useState<unknown[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEbooks = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      setError('Not authenticated');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(apiUrl('admin-ebooks'), {
        headers: getAuthHeaders(session.access_token),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to fetch ebooks');
      }

      const data = await response.json();
      setEbooks(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createEbook = async (ebookData: unknown) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('Not authenticated');

    const response = await fetch(apiUrl('admin-ebooks'), {
      method: 'POST',
      headers: getAuthHeaders(session.access_token),
      body: JSON.stringify(ebookData),
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Failed to create ebook');
    }

    return response.json();
  };

  const updateEbook = async (id: string, ebookData: unknown) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('Not authenticated');

    const response = await fetch(apiUrl(`admin-ebooks/${id}`), {
      method: 'PUT',
      headers: getAuthHeaders(session.access_token),
      body: JSON.stringify(ebookData),
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Failed to update ebook');
    }

    return response.json();
  };

  const deleteEbook = async (id: string) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('Not authenticated');

    const response = await fetch(apiUrl(`admin-ebooks/${id}`), {
      method: 'DELETE',
      headers: getAuthHeaders(session.access_token),
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Failed to delete ebook');
    }

    return response.json();
  };

  useEffect(() => {
    fetchEbooks();
  }, [fetchEbooks]);

  return { ebooks, isLoading, error, refetch: fetchEbooks, createEbook, updateEbook, deleteEbook };
}

export function useAdminEvents() {
  const [events, setEvents] = useState<unknown[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      setError('Not authenticated');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(apiUrl('admin-events'), {
        headers: getAuthHeaders(session.access_token),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to fetch events');
      }

      const data = await response.json();
      setEvents(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createEvent = async (eventData: unknown) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('Not authenticated');

    const response = await fetch(apiUrl('admin-events'), {
      method: 'POST',
      headers: getAuthHeaders(session.access_token),
      body: JSON.stringify(eventData),
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Failed to create event');
    }

    return response.json();
  };

  const updateEvent = async (id: string, eventData: unknown) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('Not authenticated');

    const response = await fetch(apiUrl(`admin-events/${id}`), {
      method: 'PUT',
      headers: getAuthHeaders(session.access_token),
      body: JSON.stringify(eventData),
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Failed to update event');
    }

    return response.json();
  };

  const deleteEvent = async (id: string) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('Not authenticated');

    const response = await fetch(apiUrl(`admin-events/${id}`), {
      method: 'DELETE',
      headers: getAuthHeaders(session.access_token),
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Failed to delete event');
    }

    return response.json();
  };

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  return { events, isLoading, error, refetch: fetchEvents, createEvent, updateEvent, deleteEvent };
}

export function useAdminLeads() {
  const [leads, setLeads] = useState<{
    ebookLeads: unknown[];
    newsletterSubscribers: unknown[];
    total: { ebookLeads: number; newsletterSubscribers: number };
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLeads = useCallback(async (type: 'all' | 'ebook' | 'newsletter' = 'all') => {
    setIsLoading(true);
    setError(null);

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      setError('Not authenticated');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(apiUrl(`admin-leads?type=${type}`), {
        headers: getAuthHeaders(session.access_token),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to fetch leads');
      }

      const data = await response.json();
      setLeads(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  return { leads, isLoading, error, refetch: fetchLeads };
}
