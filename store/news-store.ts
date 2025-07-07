import { create } from 'zustand';

interface NewsStoreState {
  selectedCategory: string | null;
  setSelectedCategory: (category: string) => void;
}

export const useNewsStore = create<NewsStoreState>((set) => ({
  selectedCategory: null,
  setSelectedCategory: (category) => set({ selectedCategory: category }),
}));
