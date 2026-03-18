import { create } from 'zustand';
import api from '../services/api';

export const useAuthStore = create((set, get) => ({
  user: JSON.parse(localStorage.getItem('auth_user') || 'null'),
  token: localStorage.getItem('auth_token') || null,

  get isAuthenticated() {
    return !!get().token;
  },

  setAuth: (user, token) => {
    localStorage.setItem('auth_token', token);
    localStorage.setItem('auth_user', JSON.stringify(user));
    set({ user, token });
  },

  login: async (email, password) => {
    const { data } = await api.post('/api/auth/login', { email, password });
    get().setAuth(data.user, data.access_token);
    return data;
  },

  register: async (name, email, password) => {
    const { data } = await api.post('/api/auth/register', { name, email, password });
    get().setAuth(data.user, data.access_token);
    return data;
  },

  logout: () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    set({ user: null, token: null });
  },

  fetchMe: async () => {
    try {
      const { data } = await api.get('/api/auth/me');
      localStorage.setItem('auth_user', JSON.stringify(data));
      set({ user: data });
      return data;
    } catch {
      get().logout();
      return null;
    }
  },
}));
