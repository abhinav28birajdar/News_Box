import React, { useEffect, useState } from "react";
import { 
  StyleSheet, 
  Text, 
  View, 
  FlatList, 
  ActivityIndicator, 
  RefreshControl,
  TextInput,
  TouchableOpacity,
  Linking
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Search, X } from "lucide-react-native";
import { StatusBar } from "expo-status-bar";
import { useTheme } from "@/context/theme-context";
import { getTopHeadlines, searchNews, Article } from "../../services/newsApi";
import { Image } from "expo-image";
import NewsCard from "@/components/NewsCard";
import CategoryPills from "@/components/CategoryPills";

export default function HomeScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const colors = theme.colors;
  const [news, setNews] = useState<Article[]>([]);
  const [filteredNews, setFilteredNews] = useState<Article[]>(news);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("");

  const fetchNews = async (category?: string, query?: string) => {
    setLoading(true);
    setError(null);
    try {
      let fetchedArticles: Article[] = [];
      if (query) {
        fetchedArticles = await searchNews(query);
      } else {
        fetchedArticles = await getTopHeadlines(category);
      }
      setNews(fetchedArticles);
      setFilteredNews(fetchedArticles); // Update filtered news as well
    } catch (err: any) {
      setError("Failed to fetch news. Please try again later.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchNews(selectedCategory || undefined);
  }, [selectedCategory]);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredNews(news);
    } else {
      // No need to filter locally, searchNews will handle it
      // This useEffect will now trigger a new API call for search
      const delayDebounceFn = setTimeout(() => {
        fetchNews(undefined, searchQuery);
      }, 500); // Debounce search input

      return () => clearTimeout(delayDebounceFn);
    }
  }, [searchQuery, news]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchNews(selectedCategory || undefined, searchQuery || undefined);
    setRefreshing(false);
  };

  const handleArticlePress = (url: string) => {
    router.push(`/article/${encodeURIComponent(url)}`);
  };

  const clearSearch = () => {
    setSearchQuery("");
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}> 
      <StatusBar style="auto" />
      <View style={styles.logoContainer}>
        <Image source={require("../../assets/images/newsboxlogo1.png")} style={styles.logo} />
      </View>

      <View style={styles.searchContainer}>
        <View style={[styles.searchBar, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Search size={20} color={colors.textSecondary} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search news..."
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={clearSearch}>
              <X size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <CategoryPills 
        selectedCategory={selectedCategory} 
        onSelectCategory={setSelectedCategory} 
      />

      {loading && !refreshing ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: colors.error }]}>
            {error}
          </Text>
          <TouchableOpacity 
            style={[styles.retryButton, { backgroundColor: colors.primary }]} 
            onPress={() => fetchNews()}
          >
            <Text style={[styles.retryButtonText, { color: colors.white }]}>
              Retry
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filteredNews}
          keyExtractor={(item, index) => item.url || `article-${index}`}
          renderItem={({ item }) => (
            <NewsCard 
              article={{
                ...item,
                description: item.description || "No description available",
                urlToImage: item.urlToImage || ""
              }} 
              onPress={() => handleArticlePress(item.url)} 
            />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
              colors={[colors.primary]}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                {searchQuery ? "No results found" : "No news available"}
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  logoContainer: { alignItems: "center", marginTop: -70, marginBottom: -20 },
  logo: { width: 120, height: 120, resizeMode: "contain" },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 2,
    borderRadius: 12,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
  },
  listContent: {
    padding: 16,
    paddingTop: 8,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 16,
  },
  retryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  emptyContainer: {
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    fontSize: 16,
    textAlign: "center",
  },
});