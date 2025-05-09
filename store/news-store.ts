import { create } from "zustand";
import { mockNews } from "@/mocks/news"; // Keep for now, or phase out
import { supabase, Post as SupabasePost } from "@/lib/supabase"; // Adjust path if needed
import { RealtimeChannel } from "@supabase/supabase-js";

// Your existing Article type might need slight adjustments or a mapping function
export interface Article {
  id: string | number; // Supabase uses number, API might use string
  title: string;
  description: string;
  content?: string;
  urlToImage: string | null; // Supabase image_url can be null
  publishedAt: string;
  source: {
    name: string;
  };
  author?: string;
  category?: string;
  isUserPost?: boolean; // To differentiate
  userProfile?: { username?: string; avatar_url?: string }; // For author info from Supabase
}

interface NewsStore {
  news: Article[];
  loading: boolean;
  error: string | null;
  selectedCategory: string;
  fetchNews: () => Promise<void>;
  setSelectedCategory: (category: string) => void;
  // addNews is now handled by Supabase insert + realtime or re-fetch
  subscribeToNewPosts: () => RealtimeChannel | undefined;
  unsubscribeFromNewPosts: (channel?: RealtimeChannel) => void;
}

const mapSupabasePostToArticle = (post: SupabasePost): Article => ({
  id: post.id.toString(), // Ensure ID is string if your components expect it
  title: post.title,
  description: post.content || '', // Use content as description if description is not a separate field
  content: post.content,
  urlToImage: post.image_url || 'https://via.placeholder.com/400x200.png?text=No+Image', // Fallback image
  publishedAt: post.published_at,
  source: { name: post.profiles?.username || 'User Generated' }, // Or a fixed name
  author: post.profiles?.full_name || post.profiles?.username || 'Unknown User',
  category: post.category,
  isUserPost: true,
  userProfile: {
    username: post.profiles?.username,
    avatar_url: post.profiles?.avatar_url,
  }
});

const mapNewsApiArticleToArticle = (apiArticle: any, category: string): Article => ({
    id: apiArticle.url || Math.random().toString(), // NewsAPI doesn't have a stable ID always
    title: apiArticle.title,
    description: apiArticle.description || '',
    content: apiArticle.content,
    urlToImage: apiArticle.urlToImage || 'https://via.placeholder.com/400x200.png?text=No+Image',
    publishedAt: apiArticle.published_at || new Date().toISOString(),
    source: { name: apiArticle.source?.name || 'NewsAPI' },
    author: apiArticle.author,
    category: category, // NewsAPI category might differ, or pass it through
    isUserPost: false,
});


export const useNewsStore = create<NewsStore>((set, get) => ({
  news: [],
  loading: false,
  error: null,
  selectedCategory: "all",
  
  fetchNews: async () => {
    set({ loading: true, error: null });
    const currentNews = get().news.filter(n => n.isUserPost); // Keep existing user posts to avoid re-fetching them constantly if realtime is on

    try {
      // 1. Fetch user-generated posts from Supabase
      let supabaseQuery = supabase
        .from('posts')
        .select('*, profiles(id, username, full_name, avatar_url)') // Join with profiles
        .order('published_at', { ascending: false });

      const category = get().selectedCategory;
      if (category !== "all") {
        supabaseQuery = supabaseQuery.eq('category', category);
      }
      const { data: userPostsData, error: userPostsError } = await supabaseQuery;

      if (userPostsError) throw userPostsError;

      const userArticles: Article[] = userPostsData ? userPostsData.map(mapSupabasePostToArticle) : [];

      // 2. Fetch news from NewsAPI.org
      let apiArticles: Article[] = [];
      if (NEWS_API_KEY) { // Only fetch if API key is present
        try {
            const newsApiCategory = category === "all" ? "general" : category; // Map 'all' to a default like 'general'
            // For "all", you might fetch top headlines without a category, or iterate through a few main ones
            const apiUrl = category === "all"
             ? `https://newsapi.org/v2/top-headlines?country=us&apiKey=${NEWS_API_KEY}`
             : `https://newsapi.org/v2/top-headlines?country=us&category=${newsApiCategory}&apiKey=${NEWS_API_KEY}`;

            const response = await fetch(apiUrl);
            if (!response.ok) {
                const errorData = await response.json();
                console.warn("NewsAPI error:", errorData.message);
                // Don't throw, allow app to function with Supabase data
            } else {
                const data = await response.json();
                apiArticles = data.articles ? data.articles.map((art: any) => mapNewsApiArticleToArticle(art, newsApiCategory)) : [];
            }
        } catch (apiError) {
            console.warn("Failed to fetch from NewsAPI:", apiError);
            // Continue with Supabase data
        }
      }


      // 3. Merge and sort
      // A more sophisticated merge would avoid duplicates if an API article was also posted by a user
      const combinedNews = [...userArticles, ...apiArticles];
      combinedNews.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
      
      set({ news: combinedNews, loading: false });

    } catch (error: any) {
      console.error("Error fetching news:", error);
      set({ 
        error: error.message || "Failed to fetch news. Please try again later.", 
        loading: false,
        news: currentNews // Revert to existing user posts on error
      });
    }
  },
  
  setSelectedCategory: (category) => {
    set({ selectedCategory: category });
    get().fetchNews(); // Re-fetch news when category changes
  },

  subscribeToNewPosts: () => {
    const channel = supabase
      .channel('custom-all-channel')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'posts' },
        (payload) => {
          console.log('Change received!', payload);
          // Basic handling: re-fetch all news.
          // More advanced: intelligently insert/update/delete from `get().news`
          if (payload.eventType === 'INSERT') {
            const newPost = payload.new as SupabasePost;
            // We need to fetch profile info for the new post, or fetchNews will do it.
            // For simplicity, just re-fetch.
             get().fetchNews();
          } else {
            get().fetchNews(); // Re-fetch for updates/deletes too
          }
        }
      )
      .subscribe();
    return channel;
  },

  unsubscribeFromNewPosts: (channel?: RealtimeChannel) => {
    if (channel) {
      supabase.removeChannel(channel);
    } else {
      supabase.removeAllChannels();
    }
  },
}));