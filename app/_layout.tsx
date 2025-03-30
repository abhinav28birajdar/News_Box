import React, { useEffect } from 'react';
import { SplashScreen, Stack } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import "@/global.css";
import { AuthProvider, useAuth } from "@/context/AuthContext";

SplashScreen.preventAutoHideAsync();

function RootAppLayout() {
  const { session, loadingInitial } = useAuth();

  useEffect(() => {
    if (!loadingInitial) {
      SplashScreen.hideAsync();
    }
  }, [loadingInitial]);

  if (loadingInitial) {
    return (
      <View className="flex-1 justify-center items-center bg-black">
        <ActivityIndicator size="large" color="white" />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      {!session ? (
        <>
          <Stack.Screen name="sign-in" />
          <Stack.Screen name="sign-up" />
          <Stack.Screen name="(tabs)" redirect={true} />
        </>
      ) : (
        <>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="sign-in" redirect={true} />
          <Stack.Screen name="sign-up" redirect={true} />
        </>
      )}
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootAppLayout />
    </AuthProvider>
  );
}