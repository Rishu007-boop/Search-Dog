import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Dog } from '../types';

interface FavoritesState {
  favorites: Dog[];
  addFavorite: (dog: Dog) => void;
  removeFavorite: (id: string) => void;
  clearFavorites: () => void;
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set) => ({
      favorites: [],
      addFavorite: (dog) =>
        set((state) => ({
          favorites: [...state.favorites, dog],
        })),
      removeFavorite: (id) =>
        set((state) => ({
          favorites: state.favorites.filter((dog) => dog.id !== id),
        })),
      clearFavorites: () => set({ favorites: [] }),
    }),
    {
      name: 'favorites-storage',
    }
  )
);