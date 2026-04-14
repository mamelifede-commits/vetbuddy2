// API Client for vetbuddy
const API_BASE = '/api';

class ApiClient {
  constructor() {
    this.token = typeof window !== 'undefined' ? localStorage.getItem('vetbuddy_token') : null;
  }

  setToken(token) {
    this.token = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('vetbuddy_token', token);
    }
  }

  clearToken() {
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('vetbuddy_token');
    }
  }

  getToken() {
    if (!this.token && typeof window !== 'undefined') {
      this.token = localStorage.getItem('vetbuddy_token');
    }
    return this.token;
  }

  async request(endpoint, options = {}) {
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    
    let response;
    try {
      response = await fetch(`${API_BASE}/${endpoint}`, {
        ...options,
        headers,
      });
    } catch (fetchError) {
      throw new Error('Errore di connessione al server. Riprova tra qualche secondo.');
    }
    
    // Check if response is JSON
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      if (!response.ok) {
        throw new Error(`Errore del server (${response.status}). Riprova tra qualche secondo.`);
      }
      // Try to parse as JSON anyway (some responses don't set content-type properly)
      try {
        const data = await response.json();
        return data;
      } catch {
        throw new Error('Risposta non valida dal server. Riprova tra qualche secondo.');
      }
    }
    
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Richiesta fallita');
    }
    return data;
  }

  get(endpoint) {
    return this.request(endpoint);
  }

  post(endpoint, body) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  put(endpoint, body) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
  }

  delete(endpoint) {
    return this.request(endpoint, {
      method: 'DELETE',
    });
  }
}

export const api = new ApiClient();
export default api;
