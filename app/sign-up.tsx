// app/sign-up.tsx
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
  ScrollView,
  Image
} from 'react-native';
import { Link, router } from 'expo-router';
import { useAuth } from '@/context/AuthContext'; // Adjust path
import { images } from '@/constants/images'; // Adjust path

const SignUpScreen: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [username, setUsername] = useState<string>('');
  const { signUpWithPassword, loadingAuthAction, session, loadingInitial } = useAuth();

  // Redirect if already logged in
  useEffect(() => {
    if (!loadingInitial && session) {
      // console.log("Already logged in, redirecting from sign-up to /");
      router.replace('/(tabs)'); // Redirect to the main tabs screen group
    }
  }, [session, loadingInitial, router]);


  const handleSignUp = async () => {
    // Trim inputs
    const trimmedEmail = email.trim();
    const trimmedUsername = username.trim();

    // Validation
    if (!trimmedEmail || !password || !trimmedUsername) {
      Alert.alert('Missing Fields', 'Please fill in all fields.');
      return;
    }
    if (password.length < 6) {
        Alert.alert('Weak Password', 'Password should be at least 6 characters long.');
        return;
    }
    if (trimmedUsername.length < 3) {
        Alert.alert('Invalid Username', 'Username should be at least 3 characters long.');
        return;
    }
    // Optional: More robust email validation regex if needed

    // Call context function
    const success = await signUpWithPassword(trimmedEmail, password, trimmedUsername);

    if (success) {
        // console.log("Sign up successful, navigation will be handled by root layout...");
         // The alert (e.g., check email) is handled within signUpWithPassword
        // Navigation is now handled by the root layout's conditional rendering
        // router.replace('/(tabs)'); // Or let the root layout handle redirect
    } else {
        // Alert is shown in the context function on failure
         console.log("Sign up failed.");
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
        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingHorizontal: 24 }}>
          <View className="items-center mb-8">
             <Image source={images.newsbox} className="w-20 h-20 mb-4 opacity-80" resizeMode='contain' />
            <Text className="text-3xl font-bold text-gray-800">Create Account</Text>
            <Text className="text-lg text-gray-600 mt-1">Join our news community</Text>
          </View>

          {/* Username Field */}
          <View className="mb-4">
            <Text className="text-sm font-medium text-gray-600 mb-1">Username</Text>
            <TextInput
              className="border border-gray-300 rounded-lg p-3 text-base text-black bg-gray-50"
              placeholder="Choose a unique username"
              placeholderTextColor="#9ca3af"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              editable={!loadingAuthAction}
            />
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
              editable={!loadingAuthAction}
            />
          </View>

          <View className="mb-6">
            <Text className="text-sm font-medium text-gray-600 mb-1">Password</Text>
            <TextInput
              className="border border-gray-300 rounded-lg p-3 text-base text-black bg-gray-50"
              placeholder="******** (min. 6 characters)"
              placeholderTextColor="#9ca3af"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
              editable={!loadingAuthAction}
            />
          </View>

          <TouchableOpacity
            className={`bg-indigo-600 rounded-lg py-4 items-center ${loadingAuthAction ? 'opacity-50' : ''}`}
            onPress={handleSignUp}
            disabled={loadingAuthAction}
          >
            {loadingAuthAction ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white text-lg font-semibold">Sign Up</Text>
            )}
          </TouchableOpacity>

          <View className="flex-row justify-center mt-6">
            <Text className="text-gray-600">Already have an account? </Text>
            <Link href="/sign-in" asChild replace>
              <TouchableOpacity disabled={loadingAuthAction}>
                <Text className="text-indigo-600 font-semibold">Sign In</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

export default SignUpScreen;