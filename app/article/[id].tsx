import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Share,
  Platform,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { Image } from "expo-image";
import { SafeAreaView } from "react-native-safe-area-context";
import { Heart, Share2, Bookmark, MessageCircle } from "lucide-react-native";
import { useTheme } from "@/context/theme-context";
import { useNewsStore } from "@/store/news-store";
import * as Haptics from "expo-haptics";

export default function ArticleDetailScreen() {
  const { id } = useLocalSearchParams();
  const { theme } = useTheme();
  const colors = theme.colors;
  const { news } = useNewsStore();
  const [article, setArticle] = useState(null);
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);

  useEffect(() => {
    if (id) {
      const foundArticle = news.find((item) => item.id.toString() === id);
      if (foundArticle) {
        setArticle(foundArticle);
      }
    }
  }, [id, news]);

  const handleLike = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setLiked(!liked);
  };

  const handleBookmark = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setBookmarked(!bookmarked);
  };

  const handleShare = async () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    if (article) {
      try {
        await Share.share({
          message: `Check out this article: ${article.title}`,
          url: article.url || "https://newsbox.app",
        });
      } catch (error) {
        console.error("Error sharing article:", error);
      }
    }
  };

  if (!article) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            Loading article...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const formattedDate = new Date(article.publishedAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Image
          source={{ uri: article.urlToImage }}
          style={styles.image}
          contentFit="cover"
        />
        
        <View style={styles.content}>
          <View style={styles.categoryRow}>
            <View style={[styles.categoryPill, { backgroundColor: colors.primary + '20' }]}>
              <Text style={[styles.categoryText, { color: colors.primary }]}>
                {article.category || "General"}
              </Text>
            </View>
            <Text style={[styles.date, { color: colors.textSecondary }]}>
              {formattedDate}
            </Text>
          </View>
          
          <Text style={[styles.title, { color: colors.text }]}>{article.title}</Text>
          
          <View style={styles.authorRow}>
            <Text style={[styles.author, { color: colors.textSecondary }]}>
              By {article.author || "Unknown Author"}
            </Text>
            <Text style={[styles.source, { color: colors.textSecondary }]}>
              {article.source?.name || "Unknown Source"}
            </Text>
          </View>
          
          <Text style={[styles.content, { color: colors.text }]}>
            {article.content || article.description}
          </Text>
        </View>
      </ScrollView>
      
      <View style={[styles.actionBar, { backgroundColor: colors.background, borderTopColor: colors.border }]}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleLike}
        >
          <Heart
            size={24}
            color={liked ? "#F43F5E" : colors.textSecondary}
            fill={liked ? "#F43F5E" : "none"}
          />
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => {}}
        >
          <MessageCircle size={24} color={colors.textSecondary} />
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleShare}
        >
          <Share2 size={24} color={colors.textSecondary} />
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleBookmark}
        >
          <Bookmark
            size={24}
            color={bookmarked ? colors.primary : colors.textSecondary}
            fill={bookmarked ? colors.primary : "none"}
          />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 16,
  },
  image: {
    width: "100%",
    height: 250,
  },
  content: {
    padding: 16,
  },
  categoryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  categoryPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: "600",
  },
  date: {
    fontSize: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 12,
    lineHeight: 32,
  },
  authorRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  author: {
    fontSize: 14,
  },
  source: {
    fontSize: 14,
  },
  actionBar: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 16,
    borderTopWidth: 1,
  },
  actionButton: {
    padding: 8,
  },
});