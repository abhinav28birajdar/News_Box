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
    setLoading(true);
    setError(null);
    try {
      const aiNews = await GeminiAPI.getLatestNews(input);
      setNews(aiNews);
    } catch (e) {
      setError("Failed to fetch AI news.");
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
        <TouchableOpacity style={styles.button} onPress={fetchAINews} disabled={loading}>
          <Text style={styles.buttonText}>{loading ? "..." : "Ask"}</Text>
        </TouchableOpacity>
      </View>
      {error && <Text style={styles.error}>{error}</Text>}
      {loading && <ActivityIndicator color={colors.primary} style={{ marginTop: 20 }} />}
      <FlatList
        data={news}
        keyExtractor={(item, idx) => item.url || idx.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => Linking.openURL(item.url)}>
            <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}> 
              <Text style={[styles.cardTitle, { color: colors.text }]}>{item.title}</Text>
              <Text style={[styles.cardDesc, { color: colors.textSecondary }]}>{item.description}</Text>
              <Text style={[styles.cardUrl, { color: colors.primary }]}>{item.url}</Text>
            </View>
          </TouchableOpacity>
        )}
        style={{ marginTop: 20 }}
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
  card: { borderWidth: 1, borderRadius: 12, padding: 12, marginBottom: 12 },
  cardTitle: { fontSize: 16, fontWeight: "bold" },
  cardDesc: { fontSize: 14, marginTop: 4 },
  cardUrl: { fontSize: 12, marginTop: 4, textDecorationLine: "underline" },
});
