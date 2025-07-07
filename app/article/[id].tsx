import React, { useState } from "react";
import {
  StyleSheet,
  View,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { WebView } from "react-native-webview";
import { useTheme } from "@/context/theme-context";

export default function ArticleDetailScreen() {
  const { id } = useLocalSearchParams();
  const { theme } = useTheme();
  const colors = theme.colors;
  const [loading, setLoading] = useState(true);

  const articleUrl = id as string;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      )}
      <WebView
        source={{ uri: articleUrl }}
        style={styles.webview}
        onLoad={() => setLoading(false)}
        onError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          console.warn('WebView error: ', nativeEvent);
          setLoading(false);
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.1)", // Semi-transparent overlay
    zIndex: 1, // Ensure it's above the WebView
  },
  webview: {
    flex: 1,
  },
});