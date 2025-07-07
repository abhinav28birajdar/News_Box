const API_KEY = "YOUR_NEWSAPI_KEY"; // Replace with your NewsAPI key
const BASE_URL = "https://newsapi.org/v2";

interface Article {
  source: { id: string | null; name: string };
  author: string | null;
  title: string;
  description: string | null;
  url: string;
  urlToImage: string | null;
  publishedAt: string;
  content: string | null;
}

interface NewsApiResponse {
  status: string;
  totalResults: number;
  articles: Article[];
}

export const getTopHeadlines = async (category?: string): Promise<Article[]> => {
  try {
    let url = `${BASE_URL}/top-headlines?country=us&apiKey=${API_KEY}`;
    if (category) {
      url += `&category=${category}`;
    }
    const response = await fetch(url);
    const data: NewsApiResponse = await response.json();

    if (data.status === "ok") {
      return data.articles;
    } else {
      console.error("NewsAPI Error:", data);
      return [];
    }
  } catch (error) {
    console.error("Error fetching top headlines:", error);
    return [];
  }
};

export const searchNews = async (query: string): Promise<Article[]> => {
  try {
    const url = `${BASE_URL}/everything?q=${query}&sortBy=relevancy&apiKey=${API_KEY}`;
    const response = await fetch(url);
    const data: NewsApiResponse = await response.json();

    if (data.status === "ok") {
      return data.articles;
    } else {
      console.error("NewsAPI Error:", data);
      return [];
    }
  } catch (error) {
    console.error("Error searching news:", error);
    return [];
  }
};
