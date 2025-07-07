import 'react-native-url-polyfill/auto'; // Needs to be at the top
import AsyncStorage from '@react-native-async-storage/async-storage'; // Or expo-secure-store
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'YOUR_SUPABASE_URL'; // Replace with your Supabase URL
const supabaseAnonKey = 'YOUR_SUPABASE_ANON_KEY'; // Replace with your Supabase Anon Key

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage, // Use AsyncStorage or SecureStore
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});