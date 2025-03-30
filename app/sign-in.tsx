// app/sign-in.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Image,
  ScrollView // Added ScrollView
} from 'react-native';
import { Link, router } from 'expo-router';
import { useAuth } from '@/context/AuthContext'; // Adjust path
import { images } from '@/constants/images'; // Adjust path

const SignInScreen: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const { signInWithPassword, loadingAuthAction, session, loadingInitial } = useAuth();

   // Redirect if already logged in
   useEffect(() => {
    if (!loadingInitial && session) {
       // console.log("Already logged in, redirecting from sign-in to /");
       router.replace('/(tabs)'); // Redirect to the main tabs screen group
    }
  }, [session, loadingInitial, router]);

  const handleSignIn = async () => {
    // Basic validation
    if (!email || !password) {
      Alert.alert('Missing Fields', 'Please enter both email and password.');
      return;
    }
    // Call the context function
    const success = await signInWithPassword(email.trim(), password);

    if (success) {
        // console.log("Sign in successful, navigating to tabs...");
        // Navigation is now handled by the root layout's conditional rendering based on session state
        // router.replace('/(tabs)'); // Or let the root layout handle the redirect
    } else {
        // Alert is shown in the context function on failure
        console.log("Sign in failed.");
    }
  };

   // Show loading indicator while checking initial auth or if already logged in
   if (loadingInitial || (!loadingInitial && session)) {
     return <View className="flex-1 justify-center items-center"><ActivityIndicator size="large" color="#4f46e5" /></View>;
   }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        {/* Use ScrollView to prevent content being pushed off by keyboard */}
        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingHorizontal: 24 }}>
            <View className="items-center mb-10">
            <Image source={images.newsbox} className="w-24 h-24 mb-4 opacity-80" resizeMode='contain' />
            <Text className="text-3xl font-bold text-gray-800">Welcome Back</Text>
            <Text className="text-lg text-gray-600 mt-1">Sign in to continue</Text>
            </View>

            <View className="mb-4">
            <Text className="text-sm font-medium text-gray-600 mb-1">Email</Text>
            <TextInput
                className="border border-gray-300 rounded-lg p-3 text-base text-black bg-gray-50"
                placeholder="you@example.com"
                placeholderTextColor="#9ca3af"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                editable={!loadingAuthAction} // Disable while loading
            />
            </View>

            <View className="mb-6">
            <Text className="text-sm font-medium text-gray-600 mb-1">Password</Text>
            <TextInput
                className="border border-gray-300 rounded-lg p-3 text-base text-black bg-gray-50"
                placeholder="********"
                placeholderTextColor="#9ca3af"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
                autoComplete="password"
                 editable={!loadingAuthAction} // Disable while loading
            />
            {/* Optional: Add Forgot Password Link here */}
            </View>

            <TouchableOpacity
            className={`bg-indigo-600 rounded-lg py-4 items-center ${loadingAuthAction ? 'opacity-50' : ''}`}
            onPress={handleSignIn}
            disabled={loadingAuthAction}
            >
            {loadingAuthAction ? (
                <ActivityIndicator color="white" />
            ) : (
                <Text className="text-white text-lg font-semibold">Sign In</Text>
            )}
            </TouchableOpacity>

            <View className="flex-row justify-center mt-6">
            <Text className="text-gray-600">Don't have an account? </Text>
            {/* Ensure Link works correctly */}
            <Link href="/sign-up" asChild replace>
                <TouchableOpacity disabled={loadingAuthAction}>
                <Text className="text-indigo-600 font-semibold">Sign Up</Text>
                </TouchableOpacity>
            </Link>
            </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

export default SignInScreen;