import React from "react";
import { Tabs } from "expo-router";
import { useColorScheme } from "react-native";
import { Home, Compass, PlusSquare, User } from "lucide-react-native";
import { useTheme } from "@/context/theme-context";

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
          headerTitle: "News Box",
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
    </Tabs>
  );
}