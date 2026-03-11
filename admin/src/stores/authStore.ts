import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AdminInfo } from '../types';

interface AuthState {
  token: string | null;
  admin: AdminInfo | null;
  setAuth: (token: string, admin: AdminInfo) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      admin: null,
      setAuth: (token, admin) => set({ token, admin }),
      logout: () => set({ token: null, admin: null }),
    }),
    {
      name: 'auth-storage',
    }
  )
);
