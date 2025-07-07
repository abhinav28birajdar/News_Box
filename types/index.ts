import { User } from '@supabase/supabase-js';

export interface Profile {
  id: string;
  username?: string;
  email?: string;
  phone_number?: string;
  age?: number;
  blood_group?: string;
  avatar_url?: string;
  updated_at?: string;
}

export interface EmergencyContact {
  id: string;
  user_id: string;
  name: string;
  phone_number: string;
  is_sos_primary?: boolean;
  created_at?: string;
}

export interface CommunityMessage {
    id: number;
    user_id: string;
    content: string;
    created_at: string;
    profiles?: { username: string; avatar_url?: string }; // For joining with profiles
}

export interface AuthSession {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
}