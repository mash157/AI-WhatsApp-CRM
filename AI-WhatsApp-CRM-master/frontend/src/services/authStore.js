import create from 'zustand';
import { authAPI, setToken, removeToken } from '../services/api';

const useAuthStore = create((set) => ({
  user: null,
  isLoggedIn: false,
  loading: false,
  error: null,

  // Register
  register: async (data) => {
    set({ loading: true, error: null });
    try {
      const response = await authAPI.register(data);
      setToken(response.data.token);
      set({ user: response.data.user, isLoggedIn: true, loading: false });
      return response.data;
    } catch (error) {
      set({ error: error.response?.data?.error || 'Registration failed', loading: false });
      throw error;
    }
  },

  // Login
  login: async (data) => {
    set({ loading: true, error: null });
    try {
      const response = await authAPI.login(data);
      setToken(response.data.token);
      set({ user: response.data.user, isLoggedIn: true, loading: false });
      return response.data;
    } catch (error) {
      set({ error: error.response?.data?.error || 'Login failed', loading: false });
      throw error;
    }
  },

  // Developer Login
  developerLogin: async (data) => {
    set({ loading: true, error: null });
    try {
      const response = await authAPI.developerLogin(data);
      setToken(response.data.token);
      set({ user: response.data.user, isLoggedIn: true, loading: false });
      return response.data;
    } catch (error) {
      set({ error: error.response?.data?.error || 'Developer login failed', loading: false });
      throw error;
    }
  },

  // Logout
  logout: async () => {
    try {
      await authAPI.logout();
      removeToken();
      set({ user: null, isLoggedIn: false });
    } catch (error) {
      console.error('Logout error:', error);
    }
  },

  // Set user from token
  setUser: (user) => {
    set({ user, isLoggedIn: !!user });
  },
}));

export default useAuthStore;
