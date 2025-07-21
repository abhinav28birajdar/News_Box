import React from "react";
import { Tabs } from "expo-router";
import { useColorScheme } from "react-native";
import { Home, Compass, PlusSquare, User, Bot } from "lucide-react-native";
import { useTheme } from "@/context/theme-context";


const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY || ""; 
const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=" +
  GEMINI_API_KEY;

export default function TabLayout() {
  const { theme } = useTheme();
  const colors = theme.colors;

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopColor: colors.border,
          height: 60,
          paddingBottom: 10,
        },
        headerStyle: {
          backgroundColor: colors.background,
        },
        headerTintColor: colors.text,
        headerShadowVisible: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => <Home size={22} color={color} />,
          headerTitle: "",
        }}
      />
      <Tabs.Screen
        name="categories"
        options={{
          title: "Categories",
          tabBarIcon: ({ color }) => <Compass size={22} color={color} />,
          headerTitle: "Categories",
        }}
      />
      <Tabs.Screen
        name="post"
        options={{
          title: "Post News",
          tabBarIcon: ({ color }) => <PlusSquare size={22} color={color} />,
          headerTitle: "Post News",
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color }) => <User size={22} color={color} />,
          headerTitle: "Profile",
        }}
      />
      <Tabs.Screen
        name="chat-ai"
        options={{
          title: "AI News",
          tabBarIcon: ({ color }) => <Bot size={22} color={color} />,
          headerTitle: "AI News Assistant",
        }}
      />
    </Tabs>
  );
}