const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

const getHeaders = () => {
  const user = localStorage.getItem('livcrowd_user');
  const headers: HeadersInit = { 'Content-Type': 'application/json' };
  if (user) {
    const { token } = JSON.parse(user);
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

export const api = {
  get: async (endpoint: string) => {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, { headers: getHeaders() });
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    return res.json();
  },
  post: async (endpoint: string, body: any) => {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    return res.status === 204 ? null : res.json().catch(() => null);
  },
  put: async (endpoint: string, body: any) => {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    return res.status === 204 ? null : res.json().catch(() => null);
  },
  delete: async (endpoint: string) => {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    return res.status === 204 ? null : res.json().catch(() => null);
  }
};
