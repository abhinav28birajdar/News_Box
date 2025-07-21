import React, { useState } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, FlatList, Linking } from "react-native";
import { GeminiAPI } from "../../services/geminiApi";
import { useTheme } from "@/context/theme-context";

interface NewsItem {
  title: string;
  url: string;
  description: string;
}

export default function ChatAIPage() {
  const { theme } = useTheme();
  const colors = theme.colors;
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fetchAINews = async () => {
    if (!input.trim()) {
      setError("Please enter a search query");
      return;
    }
    
    setLoading(true);
    setError(null);
    setNews([]); // Clear previous results
    
    try {
      console.log("Fetching AI news for query:", input);
      const aiNews = await GeminiAPI.getLatestNews(input.trim());
      console.log("Received AI news:", aiNews);
      
      if (aiNews && aiNews.length > 0) {
        setNews(aiNews);
      } else {
        setError("No news found for your query. Try a different search term.");
      }
    } catch (error: any) {
      console.error("Error in fetchAINews:", error);
      setError(error.message || "Failed to fetch AI news. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}> 
      <Text style={[styles.title, { color: colors.primary }]}>AI News Assistant</Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Ask Gemini AI for the latest news or summaries.</Text>
      <View style={styles.inputRow}>
        <TextInput
          style={[styles.input, { color: colors.text, borderColor: colors.border }]}
          placeholder="Ask about current news..."
          placeholderTextColor={colors.textSecondary}
          value={input}
          onChangeText={setInput}
        />
        <TouchableOpacity 
          style={[styles.button, { backgroundColor: colors.primary }]} 
          onPress={fetchAINews} 
          disabled={loading || !input.trim()}
        >
          <Text style={styles.buttonText}>{loading ? "Searching..." : "Ask AI"}</Text>
        </TouchableOpacity>
      </View>
      {error && (
        <View style={[styles.errorContainer, { backgroundColor: colors.card, borderColor: colors.error }]}>
          <Text style={[styles.error, { color: colors.error }]}>{error}</Text>
        </View>
      )}
      {loading && <ActivityIndicator color={colors.primary} style={{ marginTop: 20 }} size="large" />}
      
      {news.length > 0 && (
        <Text style={[styles.resultsHeader, { color: colors.text }]}>
          Found {news.length} news articles:
        </Text>
      )}
      
      <FlatList
        data={news}
        keyExtractor={(item, idx) => item.url || idx.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => Linking.openURL(item.url)}>
            <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}> 
              <Text style={[styles.cardTitle, { color: colors.text }]}>{item.title}</Text>
              <Text style={[styles.cardDesc, { color: colors.textSecondary }]}>{item.description}</Text>
              <Text style={[styles.cardUrl, { color: colors.primary }]} numberOfLines={1}>
                🔗 {item.url}
              </Text>
            </View>
          </TouchableOpacity>
        )}
        style={{ marginTop: 16 }}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 8 },
  subtitle: { fontSize: 16, marginBottom: 16 },
  inputRow: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  input: { flex: 1, borderWidth: 1, borderRadius: 8, padding: 10, marginRight: 8 },
  button: { backgroundColor: "#3B82F6", padding: 12, borderRadius: 8 },
  buttonText: { color: "#fff", fontWeight: "bold" },
  error: { color: "red", marginTop: 10 },
  errorContainer: { 
    borderWidth: 1, 
    borderRadius: 8, 
    padding: 12, 
    marginTop: 10,
    marginBottom: 10
  },
  resultsHeader: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: 16,
    marginBottom: 8
  },
  card: { borderWidth: 1, borderRadius: 12, padding: 12, marginBottom: 12 },
  cardTitle: { fontSize: 16, fontWeight: "bold" },
  cardDesc: { fontSize: 14, marginTop: 4 },
  cardUrl: { fontSize: 12, marginTop: 4, textDecorationLine: "underline" },
});
