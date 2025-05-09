import { create } from "zustand";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client
const supabaseUrl = "YOUR_SUPABASE_URL";
const supabaseKey = "YOUR_SUPABASE_API_KEY";
const supabase = createClient(supabaseUrl, supabaseKey);

// Define Article type
export interface Article {
  id: string;
  title: string;
  description: string;
  content: string;
  urlToImage: string;
  publishedAt: string;
  source: { name: string };
  author: string;
  category: string;
}

// Define the store state
interface NewsStore {
  news: Article[];
  loading: boolean;
  error: string | null;
  selectedCategory: string;
  fetchNews: () => Promise<void>;
  addNews: (article: Article) => Promise<void>;
  setSelectedCategory: (category: string) => void;
}

// Create the store with initial state and methods
export const useNewsStore = create<NewsStore>((set, get) => ({
  news: [],
  loading: false,
  error: null,
  selectedCategory: "general",
  
  // Fetch news from Supabase
  fetchNews: async () => {
    const { selectedCategory } = get();
    set({ loading: true, error: null });
    
    try {
      // Query Supabase for news articles
      let query = supabase.from("articles").select("*");
      
      // Filter by category if not "all"
      if (selectedCategory !== "all") {
        query = query.eq("category", selectedCategory);
      }
      
      // Order by published date (newest first)
      const { data, error } = await query.order("publishedAt", { ascending: false });
      
      if (error) throw error;
      
      // Set the fetched news
      set({ news: data as Article[], loading: false });
    } catch (error) {
      console.error("Error fetching news:", error);
      set({ 
        error: "Failed to fetch news. Please try again later.", 
        loading: false 
      });
    }
  },
  
  // Add a new news article
  addNews: async (article: Article) => {
    set({ loading: true, error: null });
    
    try {
      // Insert new article into Supabase
      const { error } = await supabase.from("articles").insert(article);
      
      if (error) throw error;
      
      // Update the local state with the new article
      set((state) => ({
        news: [article, ...state.news],
        loading: false
      }));
    } catch (error) {
      console.error("Error adding news:", error);
      set({ 
        error: "Failed to add news. Please try again later.", 
        loading: false 
      });
    }
  },
  
  // Set the selected category
  setSelectedCategory: (category: string) => {
    set({ selectedCategory: category });
  }
}));