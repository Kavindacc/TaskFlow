// API client for backend communication

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// Helper function to make API requests
async function fetchAPI(endpoint: string, options: RequestInit = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const config: RequestInit = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Something went wrong');
    }

    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

// API endpoints
export const api = {
  // Health check
  health: () => fetchAPI('/api/health'),

  // Auth endpoints
  auth: {
    register: (email: string, password: string, name: string) =>
      fetchAPI('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ email, password, name }),
      }),

    login: (email: string, password: string) =>
      fetchAPI('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }),

    getProfile: (token: string) =>
      fetchAPI('/api/auth/profile', {
        headers: { Authorization: `Bearer ${token}` },
      }),
  },

  // Board endpoints
  boards: {
    getAll: (token: string) =>
      fetchAPI('/api/boards', {
        headers: { Authorization: `Bearer ${token}` },
      }),

    getById: (token: string, id: string) =>
      fetchAPI(`/api/boards/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      }),

    create: (token: string, title: string) =>
      fetchAPI('/api/boards', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({ title }),
      }),

    update: (token: string, id: string, title: string) =>
      fetchAPI(`/api/boards/${id}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({ title }),
      }),

    delete: (token: string, id: string) =>
      fetchAPI(`/api/boards/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      }),
  },
};
