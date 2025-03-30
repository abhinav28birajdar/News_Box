// app/(tabs)/_layout.tsx
import React from 'react';
import { Tabs, Redirect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Image, ActivityIndicator, View } from "react-native";
import { useAuth } from "@/context/AuthContext"; // Adjust path
import { Profile } from '@/lib/supabase'; // Import Profile type

interface AccountTabIconProps {
  color: string;
  size: number;
}

// Define the Icon Component specific to the Tabs Layout
function AccountTabIcon({ color, size }: AccountTabIconProps) {
  // Use auth context HERE where it's needed for the icon
  const { session, profile, loadingInitial, loadingAuthAction } = useAuth();

  // Show spinner only if auth actions are happening *after* initial load
  const isLoading = loadingAuthAction; // Or combine if needed: loadingInitial || loadingAuthAction

  if (isLoading) {
      return <ActivityIndicator size="small" color={color} />;
  }

  const avatarUrl = profile?.avatar_url;

  if (session && avatarUrl) {
    return (
      <Image
        source={{ uri: avatarUrl }}
        style={{ width: size, height: size, borderRadius: size / 2 }}
        onError={(e) => console.log("Error loading avatar in tab:", e.nativeEvent.error)}
      />
    );
  }

  return <Ionicons name="person-outline" size={size} color={color} />;
}


export default function TabLayout() {
    const { session, loadingInitial } = useAuth();


    if (loadingInitial) {
       return <View className="flex-1 justify-center items-center bg-black"><ActivityIndicator size="large" color="white" /></View>; // Or null
    }

    


  return (
    <Tabs
      screenOptions={{
        tabBarStyle: { backgroundColor: "black", height: 60, borderTopWidth: 0 },
        tabBarLabelStyle: { fontSize: 14, fontWeight: "bold" },
        tabBarActiveTintColor: "white",
        tabBarInactiveTintColor: "gray",
        headerShown: false, // Hide headers for all tab screens by default
      }}
    >
      <Tabs.Screen
        name="index" // This corresponds to app/(tabs)/index.tsx
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="create" // app/(tabs)/create.tsx
        options={{
          title: "Create",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="create-outline" size={size} color={color} />
          ),
        }}
      />
       <Tabs.Screen
        name="camera" // app/(tabs)/camera.tsx
        options={{
          title: "Camera",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="camera-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="help" // app/(tabs)/help.tsx
        options={{
          title: "Help",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="help-circle-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="account" // app/(tabs)/account.tsx
        options={{
          title: "Account",
          tabBarIcon: ({ color, size }) => (
            // Render the icon component which uses the context
            <AccountTabIcon color={color} size={size} />
          ),
        }}
      />
    </Tabs>
  );
}