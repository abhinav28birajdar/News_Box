import React from "react";
import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from "react-native";
import { useTheme } from "@/context/theme-context";
import { categories } from "@/constants/categories";

interface CategoryPillsProps {
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
}

export default function CategoryPills({ selectedCategory, onSelectCategory }: CategoryPillsProps) {
  const { theme } = useTheme();
  const colors = theme.colors;

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <TouchableOpacity
          style={[
            styles.pill,
            {
              backgroundColor: selectedCategory === "all" ? colors.primary : colors.card,
              borderColor: colors.border,
            },
          ]}
          onPress={() => onSelectCategory("all")}
        >
          <Text
            style={[
              styles.pillText,
              { color: selectedCategory === "all" ? "#fff" : colors.text },
            ]}
          >
            All
          </Text>
        </TouchableOpacity>

        {categories.map((category) => (
          <TouchableOpacity
            key={category.value}
            style={[
              styles.pill,
              {
                backgroundColor: selectedCategory === category.value ? colors.primary : colors.card,
                borderColor: colors.border,
              },
            ]}
            onPress={() => onSelectCategory(category.value)}
          >
            <Text
              style={[
                styles.pillText,
                { color: selectedCategory === category.value ? "#fff" : colors.text },
              ]}
            >
              {category.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  scrollContent: {
    paddingHorizontal: 16,
  },
  pill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
  },
  pillText: {
    fontSize: 14,
    fontWeight: "500",
  },
});