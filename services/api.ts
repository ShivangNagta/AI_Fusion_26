const API_BASE = (import.meta as any).env?.VITE_API_URL || '/api';

export const getToken = () => localStorage.getItem('nexus_token');

export const setToken = (token: string | null) => {
  if (token) {
    localStorage.setItem('nexus_token', token);
  } else {
    localStorage.removeItem('nexus_token');
  }
};

const request = async (path: string, options: RequestInit = {}) => {
  const token = getToken();
  const headers = new Headers(options.headers || {});
  headers.set('Content-Type', 'application/json');
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || 'Request failed');
  }
  return response.json();
};

export const api = {
  login: (email: string, password: string) => request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  register: (email: string, password: string, username?: string) => request('/auth/register', { method: 'POST', body: JSON.stringify({ email, password, username }) }),
  me: () => request('/auth/me'),

  messMenu: (date?: string) => request(`/mess/menu${date ? `?date=${date}` : ''}`),
  announcements: () => request('/announcements'),
  weather: () => request('/weather'),

  summarizeMail: (text: string, subject?: string) => request('/mail/summarize', { method: 'POST', body: JSON.stringify({ text, subject }) }),
  mailSummaries: () => request('/mail/summaries'),

  lostFound: () => request('/lost-found'),
  createLostFound: (payload: any) => request('/lost-found', { method: 'POST', body: JSON.stringify(payload) }),

  marketplace: () => request('/marketplace'),
  createMarketplace: (payload: any) => request('/marketplace', { method: 'POST', body: JSON.stringify(payload) }),

  travel: () => request('/travel'),
  createTravel: (payload: any) => request('/travel', { method: 'POST', body: JSON.stringify(payload) }),

  nearby: () => request('/nearby'),
  nearbyRecommendations: (payload: any) => request('/nearby/recommendations', { method: 'POST', body: JSON.stringify(payload) }),

  timetable: () => request('/timetable'),
  createTimetable: (payload: any) => request('/timetable', { method: 'POST', body: JSON.stringify(payload) }),

  assignments: () => request('/assignments'),
  createAssignment: (payload: any) => request('/assignments', { method: 'POST', body: JSON.stringify(payload) }),

  submitAssignment: (payload: any) => request('/submissions', { method: 'POST', body: JSON.stringify(payload) }),
  grades: () => request('/grades'),

  navigationAdvice: (payload: any) => request('/navigation/advice', { method: 'POST', body: JSON.stringify(payload) }),
  
  chat: (message: string) => request('/chat', { method: 'POST', body: JSON.stringify({ message }) })
};
