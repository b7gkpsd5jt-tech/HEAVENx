import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '@/lib/api';

export interface User {
  id: string;
  username: string;
  email?: string;
  role: 'ADMIN' | 'USER';
  language: 'DE' | 'EN' | 'FA';
  readMode: 'NORMAL' | 'INVERT' | 'CLASSIC_INVERT' | 'GRAYSCALE' | 'SEPIA';
  darkMode: boolean;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  login: (username: string, password: string, rememberMe?: boolean) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  updateUser: (data: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,

      setUser: (user) => set({ user, isAuthenticated: !!user }),

      login: async (username, password, rememberMe = false) => {
        set({ isLoading: true });
        try {
          const response = await api.post<{ user: User; accessToken: string }>('/api/auth/login', { username, password, rememberMe });
          api.setToken(response.accessToken);
          set({ user: response.user, isAuthenticated: true, isLoading: false });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      logout: async () => {
        try { await api.post('/api/auth/logout'); } catch {}
        api.setToken(null);
        set({ user: null, isAuthenticated: false });
      },

      refreshUser: async () => {
        try {
          const user = await api.get<User>('/api/auth/me');
          set({ user, isAuthenticated: true });
        } catch {
          set({ user: null, isAuthenticated: false });
        }
      },

      updateUser: (data) => {
        const { user } = get();
        if (user) set({ user: { ...user, ...data } });
      },
    }),
    { name: 'heavenx-auth', partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }) }
  )
);
