import AsyncStorage from '@react-native-async-storage/async-storage'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = "https://kufelzfarnjbocirwncv.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt1ZmVsemZhcm5qYm9jaXJ3bmN2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMyNTc1OTMsImV4cCI6MjA1ODgzMzU5M30.LKeRU_HY20LX1OrUUvF8SGt8o1m6XHTHikcfEao7rnU";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})