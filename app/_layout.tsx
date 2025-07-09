import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { Platform } from "react-native";
import { ErrorBoundary } from "./error-boundary";
import { ThemeProvider } from "@/context/theme-context";
import { AuthProvider } from "@/context/AuthContext";

export const unstable_settings = {
  initialRouteName: "(tabs)",
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    ...FontAwesome.font,
  });

  useEffect(() => {
    if (error) {
      console.error(error);
      throw error;
    }
  }, [loaded]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <RootLayoutNav />
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

function RootLayoutNav() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen 
        name="article/[id]" 
        options={{ 
          headerShown: true,
          headerTitle: "Article",
          headerBackTitle: "Back",
          headerTintColor: "#3B82F6",
          headerStyle: { backgroundColor: "#FFFFFF" },
        }} 
      />
      <Stack.Screen 
        name="auth/login" 
        options={{ 
          headerShown: false,
          presentation: "modal" 
        }} 
      />
      <Stack.Screen 
        name="auth/signup" 
        options={{ 
          headerShown: false,
          presentation: "modal" 
        }} 
      />
      <Stack.Screen 
        name="chat-ai" 
        options={{ 
          headerShown: true,
          headerTitle: "AI News Assistant",
          headerBackTitle: "Back",
          headerTintColor: "#3B82F6",
          headerStyle: { backgroundColor: "#FFFFFF" },
        }} 
      />
    </Stack>
  );
}