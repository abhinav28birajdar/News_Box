import React, { useState } from "react";
import {
  StyleSheet,
  View,
  ActivityIndicator,
  Text,
  TouchableOpacity,
  Linking,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { WebView } from "react-native-webview";
import { useTheme } from "@/context/theme-context";

export default function ArticleDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { theme } = useTheme();
  const colors = theme.colors;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Decode the URL in case it was encoded when passed as parameter
  const articleUrl = decodeURIComponent(id as string);

  // Validate URL format
  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleOpenInBrowser = () => {
    Linking.openURL(articleUrl);
  };

  const handleGoBack = () => {
    router.back();
  };

  if (!isValidUrl(articleUrl)) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.errorContainer}>
          <Text style={[styles.errorTitle, { color: colors.text }]}>Invalid URL</Text>
          <Text style={[styles.errorMessage, { color: colors.textSecondary }]}>
            The article link appears to be invalid.
          </Text>
          <TouchableOpacity 
            style={[styles.button, { backgroundColor: colors.primary }]}
            onPress={handleGoBack}
          >
            <Text style={[styles.buttonText, { color: colors.white }]}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {loading && !error && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      )}
      
      {error && (
        <View style={styles.errorContainer}>
          <Text style={[styles.errorTitle, { color: colors.text }]}>Failed to Load</Text>
          <Text style={[styles.errorMessage, { color: colors.textSecondary }]}>
            Unable to load the article. Would you like to open it in your browser?
          </Text>
          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={[styles.button, { backgroundColor: colors.primary }]}
              onPress={handleOpenInBrowser}
            >
              <Text style={[styles.buttonText, { color: colors.white }]}>Open in Browser</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.button, styles.secondaryButton, { borderColor: colors.primary }]}
              onPress={handleGoBack}
            >
              <Text style={[styles.buttonText, { color: colors.primary }]}>Go Back</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
      
      {!error && (
        <WebView
          source={{ uri: articleUrl }}
          style={styles.webview}
          onLoad={() => setLoading(false)}
          onError={(syntheticEvent) => {
            const { nativeEvent } = syntheticEvent;
            console.warn('WebView error: ', nativeEvent);
            setLoading(false);
            setError(true);
          }}
          onLoadEnd={() => setLoading(false)}
          startInLoadingState={true}
          javaScriptEnabled={true}
          domStorageEnabled={true}
        />
      )}
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
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  errorMessage: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 30,
    lineHeight: 22,
  },
  buttonContainer: {
    width: "100%",
    gap: 12,
  },
  button: {
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 50,
  },
  secondaryButton: {
    backgroundColor: "transparent",
    borderWidth: 2,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
  },
});