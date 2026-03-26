import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const getAuthHeaders = async () => {
  const { data: { session } } = await supabase.auth.getSession();

  if (session?.access_token) {
    return {
      'Authorization': `Bearer ${session.access_token}`,
      'Content-Type': 'application/json',
    };
  }

  const { data: refreshed } = await supabase.auth.refreshSession();
  if (refreshed.session?.access_token) {
    return {
      'Authorization': `Bearer ${refreshed.session.access_token}`,
      'Content-Type': 'application/json',
    };
  }

  throw new Error('No active session. Please log in again.');
};

export const adminApi = {
  baseUrl: `${supabaseUrl}/functions/v1`,

  async fetch(endpoint: string, options: RequestInit = {}) {
    const headers = await getAuthHeaders();
    const response = await fetch(`${this.baseUrl}/${endpoint}`, {
      ...options,
      headers: {
        ...headers,
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(error.error || 'Request failed');
    }

    return response.json();
  },

  async get(endpoint: string) {
    return this.fetch(endpoint, { method: 'GET' });
  },

  async post(endpoint: string, data: unknown) {
    return this.fetch(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async put(endpoint: string, data: unknown) {
    return this.fetch(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async delete(endpoint: string) {
    return this.fetch(endpoint, { method: 'DELETE' });
  },

  async deleteBulk(endpoint: string, data: unknown) {
    return this.fetch(endpoint, {
      method: 'DELETE',
      body: JSON.stringify(data),
    });
  },
};
