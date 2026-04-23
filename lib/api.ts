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

    inviteMember: (token: string, boardId: string, email: string) =>
      fetchAPI(`/api/boards/${boardId}/members`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({ email }),
      }),

    removeMember: (token: string, boardId: string, userId: string) =>
      fetchAPI(`/api/boards/${boardId}/members/${userId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      }),
  },

  // List endpoints
  lists: {
    create: (token: string, boardId: string, title: string) =>
      fetchAPI(`/api/boards/${boardId}/lists`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({ title }),
      }),

    update: (token: string, id: string, data: {
      title?: string;
      isComplete?: boolean;
      assigneeId?: string | null;
      priority?: string;
      dueDate?: string | null;
      effortTotal?: number;
      effortLogged?: number;
    }) =>
      fetchAPI(`/api/lists/${id}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify(data),
      }),

    delete: (token: string, id: string) =>
      fetchAPI(`/api/lists/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      }),

    reorder: (token: string, lists: { id: string; order: number }[]) =>
      fetchAPI('/api/lists/reorder', {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({ lists }),
      }),
  },

  // Card endpoints
  cards: {
    create: (token: string, listId: string, title: string) =>
      fetchAPI(`/api/lists/${listId}/cards`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({ title }),
      }),

    get: (token: string, id: string) =>
      fetchAPI(`/api/cards/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      }),

    update: (token: string, id: string, data: {
      title?: string;
      description?: string;
      labels?: string[];
      dueDate?: string | null;
      isComplete?: boolean;
      assigneeId?: string | null;
    }) =>
      fetchAPI(`/api/cards/${id}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify(data),
      }),

    delete: (token: string, id: string) =>
      fetchAPI(`/api/cards/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      }),

    move: (token: string, id: string, listId: string, order: number) =>
      fetchAPI(`/api/cards/${id}/move`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({ listId, order }),
      }),
  },

  // Comment endpoints
  comments: {
    create: (token: string, cardId: string, text: string) =>
      fetchAPI(`/api/cards/${cardId}/comments`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({ text }),
      }),

    delete: (token: string, commentId: string) =>
      fetchAPI(`/api/comments/${commentId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      }),
  },
};
