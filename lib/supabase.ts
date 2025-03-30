// lib/supabase.ts

import 'react-native-url-polyfill/auto';
import * as SecureStore from 'expo-secure-store';
import { createClient, Session, User, SupabaseClient } from '@supabase/supabase-js'; // Import SupabaseClient type
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native'; // Import Alert
import { decode } from 'base64-arraybuffer'; // Import for decoding base64

// Define the Profile type based on your Supabase table
export interface Profile {
  id?: string; // Optional ID if you need it client-side, maps to user ID
  username: string | null;
  avatar_url: string | null;
  updated_at?: string; // Add updated_at if you use it in updateProfile
  // Add other profile fields here if needed
}

// Define an adapter for Expo SecureStore (no type changes needed here usually)
// Not actively used if AsyncStorage is the primary storage for auth
const ExpoSecureStoreAdapter = {
  getItem: (key: string): Promise<string | null> => {
    return SecureStore.getItemAsync(key);
  },
  setItem: (key: string, value: string): Promise<void> => {
    return SecureStore.setItemAsync(key, value);
  },
  removeItem: (key: string): Promise<void> => {
    return SecureStore.deleteItemAsync(key);
  },
};

// --- Supabase Credentials (Provided by User) ---
const supabaseUrl = 'https://kufelzfarnjbocirwncv.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt1ZmVsemZhcm5qYm9jaXJ3bmN2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMyNTc1OTMsImV4cCI6MjA1ODgzMzU5M30.LKeRU_HY20LX1OrUUvF8SGt8o1m6XHTHikcfEao7rnU';
// --- Use Environment Variables in production! ---

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Supabase URL or Anon Key is missing. App might not function correctly.");
  Alert.alert("Configuration Error", "Supabase credentials are not set.");
  // Throwing an error might be better in some cases to halt execution
  // throw new Error("Supabase URL or Anon Key is missing.");
}

// Initialize Supabase client
// Use SupabaseClient type for better type checking
export const supabase: SupabaseClient = createClient(supabaseUrl!, supabaseAnonKey!, {
  auth: {
    storage: AsyncStorage, // Use AsyncStorage for session persistence in React Native
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false, // Required for React Native
  },
});

// Helper function to get profile data
export const getProfile = async (userId: string): Promise<Profile | null> => {
  console.log(`Fetching profile for userId: ${userId}`); // Log start
  try {
    const { data, error, status } = await supabase
      .from('profiles') // Ensure 'profiles' matches your table name
      .select(`username, avatar_url`) // Select fields matching the Profile interface
      .eq('id', userId)
      .single(); // Expects exactly one row or null

    // Log the raw response for debugging
    // console.log(`Supabase getProfile response - Status: ${status}, Error: ${error?.message}, Data: ${JSON.stringify(data)}`);

    if (error && status !== 406) { // 406: "Not Acceptable", standard Supabase response when record not found with .single()
      console.error(`Supabase error fetching profile (Status ${status}):`, error.message);
      throw error; // Rethrow the error to be caught below
    }

    if (!data) {
        console.log(`No profile found for userId: ${userId}`);
        return null; // Explicitly return null if no data found (status 406)
    }

    // Ensure the returned data structure matches the Profile interface
    console.log(`Profile found for userId ${userId}:`, data);
    return { username: data.username, avatar_url: data.avatar_url };

  } catch (error: any) { // Catch any error type
     const message = (error && typeof error === 'object' && 'message' in error) ? error.message : 'An unknown error occurred';
     console.error(`Error in getProfile function for userId ${userId}:`, message);
     // Avoid alerting the user here unless necessary, let the calling function decide
    return null; // Return null on failure
  }
};

// Helper function to update profile data
export const updateProfile = async (userId: string, updates: Partial<Profile>): Promise<boolean> => {
   console.log(`Updating profile for userId: ${userId} with updates:`, updates); // Log start
   try {
     // Prepare the update object, automatically including updated_at
     // Make sure your 'profiles' table has an 'updated_at' column of type 'timestamp with time zone'
     // and it's configured to update automatically (e.g., default value now()) OR handle it manually like here.
     const updateData = {
       ...updates,
       updated_at: new Date().toISOString(), // Set timestamp on update
     };

     const { error } = await supabase
       .from('profiles')
       .update(updateData)
       .eq('id', userId); // Ensure update targets the correct user

     if (error) {
       console.error(`Supabase error updating profile for userId ${userId}:`, error.message);
       throw error; // Throw if Supabase returns an error
     }
     console.log(`Profile updated successfully for userId: ${userId}`);
     return true; // Return true on success

   } catch (error: any) {
     const message = (error && typeof error === 'object' && 'message' in error) ? error.message : 'An unknown error occurred';
     console.error(`Error in updateProfile function for userId ${userId}:`, message);
     Alert.alert('Update Failed', `Could not update profile: ${message}`); // Alert user on failure
     return false; // Return false on failure
   }
};


// *** ADDED uploadAvatar Function ***
/**
 * Uploads an avatar image to Supabase Storage.
 * @param userId - The ID of the user uploading the avatar.
 * @param base64Data - The base64 encoded string of the image.
 * @param fileExt - The file extension (e.g., 'jpg', 'png').
 * @returns The public URL of the uploaded image or null on failure.
 */
export const uploadAvatar = async (userId: string, base64Data: string, fileExt: string): Promise<string | null> => {
    try {
        // Generate a unique path for the file in the storage bucket
        // Format: userId/timestamp.extension
        const path = `${userId}/${Date.now()}.${fileExt}`;
        const contentType = `image/${fileExt}`; // Determine MIME type based on extension

        console.log(`Attempting to upload avatar to bucket 'avatars' at path: ${path} with contentType: ${contentType}`);

        // Use decode from base64-arraybuffer to convert base64 to ArrayBuffer for upload
        const arrayBuffer = decode(base64Data);

        // Upload the file to the 'avatars' bucket
        // Ensure 'avatars' bucket exists in your Supabase project Storage.
        // Ensure RLS policies on the bucket allow authenticated users to upload to their own folder (path starting with their userId).
        const { data, error: uploadError } = await supabase.storage
            .from('avatars') // Bucket name
            .upload(path, arrayBuffer, { // Use the decoded ArrayBuffer
                contentType,
                upsert: true, // Replace file if it exists at the same path (optional, useful for retries)
            });

        if (uploadError) {
             console.error("Supabase storage upload error:", uploadError);
             throw uploadError; // Rethrow to be caught below
        }
        if (!data) {
             // This case might indicate an issue even without an explicit error object
             console.error("Supabase storage upload returned no data object.");
             throw new Error("Upload completed but no data returned from storage operation.");
        }

        console.log("Storage upload successful, response data:", data);
        console.log("Getting public URL for uploaded file at path:", path);

        // Get the public URL for the uploaded file to store in the profile table
        const { data: urlData } = supabase.storage
            .from('avatars')
            .getPublicUrl(path);

        // Check if the publicUrl exists in the returned data
        if (!urlData?.publicUrl) {
             console.error("Could not get public URL after upload. URL data:", urlData);
             // Attempt cleanup? Deleting the uploaded file might be complex if URL retrieval fails.
             throw new Error("File uploaded successfully, but failed to retrieve its public URL.");
        }

        console.log("Public URL obtained:", urlData.publicUrl);
        return urlData.publicUrl; // Return the public URL

    } catch (error: any) {
        const message = (error && typeof error === 'object' && 'message' in error) ? error.message : 'An unknown error occurred during upload';
        console.error("Error during image upload process:", message);
        // Log the full error if available for more details
        if (error) console.error(error);
        Alert.alert("Upload Failed", `Could not upload image: ${message}`);
        return null; // Return null on any failure in the process
    }
};

// You can add other Supabase related helper functions here