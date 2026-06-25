const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

class ApiClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('access_token');
    }
  }

  setToken(token: string | null) {
    this.token = token;
    if (typeof window !== 'undefined') {
      if (token) localStorage.setItem('access_token', token);
      else localStorage.removeItem('access_token');
    }
  }

  private async request<T>(method: string, path: string, body?: unknown): Promise<T> {
    const headers: Record<string, string> = {};
    if (!(body instanceof FormData)) headers['Content-Type'] = 'application/json';
    if (this.token) headers['Authorization'] = `Bearer ${this.token}`;

    const response = await fetch(`${this.baseUrl}${path}`, {
      method,
      headers,
      body: body ? (body instanceof FormData ? body : JSON.stringify(body)) : undefined,
      credentials: 'include',
    });

    if (response.status === 401) {
      this.setToken(null);
      if (typeof window !== 'undefined') window.location.href = '/login';
      throw new Error('Unauthorized');
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(error.error || 'Request failed');
    }

    if (response.status === 204) return {} as T;
    return response.json();
  }

  get<T>(path: string): Promise<T> { return this.request<T>('GET', path); }
  post<T>(path: string, body?: unknown): Promise<T> { return this.request<T>('POST', path, body); }
  patch<T>(path: string, body?: unknown): Promise<T> { return this.request<T>('PATCH', path, body); }
  delete<T>(path: string): Promise<T> { return this.request<T>('DELETE', path); }
  upload<T>(path: string, formData: FormData): Promise<T> { return this.request<T>('POST', path, formData); }
}

export const api = new ApiClient(API_BASE);
export default api;
