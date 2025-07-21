import { create } from 'zustand';

interface Article {
  id: string;
  title: string;
  description: string;
  content?: string;
  urlToImage: string;
  publishedAt: string;
  source: { name: string };
  author?: string;
  category?: string;
  url?: string;
}

interface NewsStoreState {
  selectedCategory: string | null;
  userNews: Article[];
  setSelectedCategory: (category: string) => void;
  addNews: (article: Article) => void;
  removeNews: (id: string) => void;
}

export const useNewsStore = create<NewsStoreState>((set) => ({
  selectedCategory: null,
  userNews: [],
  setSelectedCategory: (category) => set({ selectedCategory: category }),
  addNews: (article) => set((state) => ({ 
    userNews: [article, ...state.userNews] 
  })),
  removeNews: (id) => set((state) => ({ 
    userNews: state.userNews.filter(article => article.id !== id) 
  })),
}));
