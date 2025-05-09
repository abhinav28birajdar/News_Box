import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import 'react-native-url-polyfill/auto'; // Required for Supabase to work in React Native

// Find these in your Supabase project settings > API
const supabaseUrl = 'YOUR_SUPABASE_URL';
const supabaseAnonKey = 'YOUR_SUPABASE_ANON_KEY';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    'Supabase URL or Anon Key is missing. Please check your environment variables or lib/supabase.ts'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false, // Important for React Native
  },
});

// Define types for your tables for better intellisense (optional but recommended)
export interface Profile {
  id: string;
  username?: string;
  full_name?: string;
  avatar_url?: string;
  updated_at?: string;
}

export interface Post {
  id: number;
  user_id: string;
  title: string;
  content?: string;
  image_url?: string;
  category?: string;
  published_at: string;
  created_at: string;
  profiles?: Profile; // For joined data
}