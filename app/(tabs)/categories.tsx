import React from "react";
import { StyleSheet, Text, View, FlatList, TouchableOpacity, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useTheme } from "@/context/theme-context";
import { useNewsStore } from "@/store/news-store";
import { categories } from "@/constants/categories";

export default function CategoriesScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const colors = theme.colors;
  const { setSelectedCategory } = useNewsStore();

  const handleCategoryPress = (category) => {
    setSelectedCategory(category.value);
    router.push("/");
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>Browse Categories</Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
        Discover news from different categories
      </Text>

      <FlatList
        data={categories}
        keyExtractor={(item) => item.value}
        numColumns={2}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.categoryCard,
              { 
                backgroundColor: colors.card,
                borderColor: colors.border,
              }
            ]}
            onPress={() => handleCategoryPress(item)}
          >
            <View style={[styles.imageContainer, { backgroundColor: item.color + '20' }]}>
              <Image source={{ uri: item.imageUrl }} style={styles.categoryImage} />
            </View>
            <Text style={[styles.categoryName, { color: colors.text }]}>
              {item.label}
            </Text>
            <Text style={[styles.categoryDescription, { color: colors.textSecondary }]}>
              {item.description}
            </Text>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 24,
  },
  listContent: {
    paddingBottom: 24,
  },
  categoryCard: {
    flex: 1,
    margin: 8,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: "center",
  },
  imageContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  categoryImage: {
    width: 30,
    height: 30,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
    textAlign: "center",
  },
  categoryDescription: {
    fontSize: 12,
    textAlign: "center",
  },
});