// app/(tabs)/account.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  Image,
  ActivityIndicator,
  Alert,
  ScrollView
} from 'react-native';
import { Redirect } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import * as ImagePicker from 'expo-image-picker';
import { supabase, updateProfile, uploadAvatar, Profile } from '@/lib/supabase'; // Correct import path assumed
import { Ionicons } from '@expo/vector-icons';

const AccountScreen: React.FC = () => {
  const { session, user, profile, loadingInitial, loadingAuthAction, signOut, fetchProfile, updateUserProfile } = useAuth();
  const [uploading, setUploading] = useState<boolean>(false);
  const [displayAvatarUrl, setDisplayAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    setDisplayAvatarUrl(profile?.avatar_url ?? null);
  }, [profile?.avatar_url]);

  useEffect(() => {
      (async () => {
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      })();
  }, []);

  const handleSignOut = async () => {
    await signOut();
  };

  const pickImage = async () => {
    // --- Initial User Check ---
    if (!user) {
      console.warn("pickImage called but user is null.");
      Alert.alert("Not Logged In", "You need to be logged in to change your picture.");
      return;
    }
    // Although user is checked, TS might lose track across awaits.

    // --- Check Permissions ---
    const permissionResult = await ImagePicker.getMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
        const requestResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!requestResult.granted) {
             Alert.alert('Permission Denied','Allow access to your photos to upload a profile picture.');
             return;
        }
    }

    // --- Launch Image Picker ---
    try {
      let result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.6,
          base64: true, // Request base64
      });

      // --- Process Result ---
      if (!result.canceled && result.assets && result.assets[0]?.base64 && result.assets[0]?.uri) {
          // Asset selected successfully

          // Re-check user here just in case, although the main fix is the non-null assertion below
          if (!user) {
             console.error("User became null unexpectedly during image selection.");
             Alert.alert("Session Error", "Please log in again.");
             return;
          }

          const asset = result.assets[0];
          const base64 = asset.base64;
          const uri = asset.uri;
          const fileExt = uri.split('.').pop()?.toLowerCase() ?? 'jpg';

          setUploading(true); // Set loading state

          // --- Perform Upload and Update ---
          // *** FIX: Use the non-null assertion operator (!) on user.id ***
          // This tells TypeScript to trust that 'user' is not null here,
          // based on the check at the beginning of the function.
          const newAvatarPublicUrl = await uploadAvatar(user!.id, base64, fileExt); // Line 73 (approx)

          if (newAvatarPublicUrl) {
              // Update profile in DB via context function
              const success = await updateUserProfile({ avatar_url: newAvatarPublicUrl });
              if (success) {
                 Alert.alert("Success", "Profile picture updated!");
              } // Error handled in updateUserProfile
          } // Error handled in uploadAvatar

      } else if (!result.canceled) {
          console.warn("Image picker result missing required data:", result.assets ? result.assets[0] : 'No Assets');
           Alert.alert("Error", "Could not get image data. Please try a different image.");
      }
      // If result.canceled, do nothing

    } catch (error: any) {
       console.error("Error during pickImage process:", error);
       Alert.alert("Error", `Failed to update picture: ${error.message}`);
    } finally {
       // --- Reset Loading State ---
       setUploading(false);
    }
  };


  // --- Render Logic ---

  if (loadingInitial) {
    return <SafeAreaView className="flex-1 bg-gray-50 justify-center items-center"><ActivityIndicator size="large" color="#4f46e5" /></SafeAreaView>;
  }

  if (!session || !user) {
      console.log("AccountScreen: No session or user found, redirecting to sign-in.");
      return <Redirect href="/sign-in" />;
  }

  // --- Render Logged-in View ---
  return (
    <SafeAreaView className="flex-1 bg-gray-50">
       <ScrollView contentContainerStyle={{ paddingBottom: 40}}>
           <View className="p-6 items-center">
                {/* Profile Picture Section */}
                <View className="relative mb-6 items-center">
                    <TouchableOpacity
                       onPress={pickImage}
                       disabled={uploading || loadingAuthAction}
                       className="items-center justify-center">
                        <View className="w-32 h-32 rounded-full border-4 border-indigo-200 bg-gray-300 overflow-hidden justify-center items-center">
                            {displayAvatarUrl ? (
                                <Image
                                    source={{ uri: displayAvatarUrl }}
                                    className="w-full h-full"
                                    resizeMode='cover'
                                    onError={(e) => console.warn("Error loading profile image:", e.nativeEvent.error)}
                                />
                            ) : (
                                <Ionicons name="person-outline" size={60} color="#6b7280" />
                            )}
                        </View>
                         <View
                            className={`absolute bottom-0 right-0 bg-indigo-600 rounded-full p-2 border-2 border-white flex items-center justify-center
                                ${uploading || loadingAuthAction ? 'opacity-70' : ''}`}
                            style={{ width: 40, height: 40 }}
                            >
                            {uploading ? (
                                <ActivityIndicator size="small" color="white"/>
                            ) : (
                                <Ionicons name="camera-outline" size={20} color="white" />
                             )}
                         </View>
                    </TouchableOpacity>
                     {!uploading && <Text className="text-xs text-gray-500 mt-2">Tap to change picture</Text>}
                </View>

                {/* User Info */}
                <Text className="text-2xl font-bold text-gray-800 text-center" numberOfLines={1}>
                {profile?.username || 'User'}
                </Text>
                {/* Use user from context directly here, it's guaranteed non-null by the check above */}
                <Text className="text-lg text-gray-500 mt-1 mb-8 text-center" numberOfLines={1}>{user.email}</Text>

                {/* Sign Out Button */}
                <TouchableOpacity
                    className={`bg-red-500 w-full rounded-lg py-3 items-center mt-10 ${loadingAuthAction ? 'opacity-50' : ''}`}
                    onPress={handleSignOut}
                    disabled={loadingAuthAction || uploading}
                >
                    {loadingAuthAction && !uploading ? <ActivityIndicator color="white" /> : <Text className="text-white text-lg font-semibold">Sign Out</Text> }
                </TouchableOpacity>
           </View>
        </ScrollView>
    </SafeAreaView>
  );
}

export default AccountScreen;