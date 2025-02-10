import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  user: { name: string; email: string } | null;
  setUser: (user: { name: string; email: string } | null) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      setUser: (user) => set({ user }),
    }),
    {
      name: 'auth-storage',
    }
  )
);