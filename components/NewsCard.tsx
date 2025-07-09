import React from "react";
import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import { Image } from "expo-image";
import { useTheme } from "@/context/theme-context";

interface NewsCardProps {
  article: {
    id: string;
    title: string;
    description: string;
    urlToImage: string;
    publishedAt: string;
    source: {
      name: string;
    };
    category?: string;
    url: string;
  };
  onPress: () => void;
}

export default function NewsCard({ article, onPress }: NewsCardProps) {
  const { theme } = useTheme();
  const colors = theme.colors;

  const formattedDate = new Date(article.publishedAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

  return (
    <TouchableOpacity
      style={[
        styles.card,
        { backgroundColor: colors.card, borderColor: colors.border }
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Image
        source={{ uri: article.urlToImage }}
        style={styles.image}
        contentFit="cover"
        transition={200}
      />
      <View style={styles.content}>
        {article.category && (
          <View style={[styles.categoryPill, { backgroundColor: colors.primary + "20" }]}>
            <Text style={[styles.categoryText, { color: colors.primary }]}>
              {article.category}
            </Text>
          </View>
        )}
        <Text style={[styles.title, { color: colors.text }]} numberOfLines={2}>
          {article.title}
        </Text>
        <Text style={[styles.description, { color: colors.textSecondary }]} numberOfLines={2}>
          {article.description}
        </Text>
        <View style={styles.footer}>
          <Text style={[styles.source, { color: colors.textSecondary }]}>
            {article.source.name}
          </Text>
          <Text style={[styles.date, { color: colors.textSecondary }]}>
            {formattedDate}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 16,
    borderWidth: 1,
  },
  image: {
    width: "100%",
    height: 180,
    borderRadius: 8,
  },
  content: {
    padding: 16,
  },
  categoryPill: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: "600",
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 8,
    lineHeight: 24,
  },
  description: {
    fontSize: 14,
    marginBottom: 12,
    lineHeight: 20,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  source: {
    fontSize: 12,
    fontWeight: "500",
  },
  date: {
    fontSize: 12,
  },
});