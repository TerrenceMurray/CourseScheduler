import { config } from '@/config/env';
import { supabase } from '@/lib/supabase';

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function getAuthHeaders(): Promise<HeadersInit> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  const { data: { session } } = await supabase.auth.getSession();
  if (session?.access_token) {
    headers['Authorization'] = `Bearer ${session.access_token}`;
  }

  return headers;
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    // Handle 401 Unauthorized - redirect to signin
    if (response.status === 401) {
      window.location.href = '/signin';
      throw new ApiError(401, 'Session expired. Please sign in again.');
    }

    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new ApiError(response.status, error.error || 'Request failed');
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}

export const apiClient = {
  async get<T>(endpoint: string): Promise<T> {
    const headers = await getAuthHeaders();
    const response = await fetch(`${config.apiBaseUrl}${endpoint}`, {
      headers,
    });
    return handleResponse<T>(response);
  },

  async post<T>(endpoint: string, data?: unknown): Promise<T> {
    const headers = await getAuthHeaders();
    const response = await fetch(`${config.apiBaseUrl}${endpoint}`, {
      method: 'POST',
      headers,
      body: data ? JSON.stringify(data) : undefined,
    });
    return handleResponse<T>(response);
  },

  async put<T>(endpoint: string, data: unknown): Promise<T> {
    const headers = await getAuthHeaders();
    const response = await fetch(`${config.apiBaseUrl}${endpoint}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(data),
    });
    return handleResponse<T>(response);
  },

  async delete(endpoint: string): Promise<void> {
    const headers = await getAuthHeaders();
    const response = await fetch(`${config.apiBaseUrl}${endpoint}`, {
      method: 'DELETE',
      headers,
    });
    return handleResponse<void>(response);
  },
};
