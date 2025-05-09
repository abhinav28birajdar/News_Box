import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { supabase, Profile } from "@/lib/supabase"; //  Adjust path if needed
import { Session, User as SupabaseUser } from "@supabase/supabase-js";

interface AuthStoreUser extends Profile { // Combine SupabaseUser and your Profile type
  email?: string; // From SupabaseUser
}

interface AuthStore {
  user: AuthStoreUser | null;
  session: Session | null;
  isAuthenticated: boolean; // Derived from session
  loading: boolean;
  initializeAuth: () => Promise<void>;
  loginWithPassword: (email: string, password: string) => Promise<void>;
  signupWithPassword: (email: string, password: string, fullName: string) => Promise<void>;
  logout: () => Promise<void>;
  setSession: (session: Session | null) => void; // For external session updates
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      session: null,
      isAuthenticated: false,
      loading: true, // Start with loading true

      initializeAuth: async () => {
        set({ loading: true });
        const { data: { session }, error } = await supabase.auth.getSession();
        if (session) {
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          set({
            session,
            user: profileData ? { ...profileData, email: session.user.email } : { id: session.user.id, email: session.user.email },
            isAuthenticated: true,
            loading: false,
          });
        } else {
          set({ session: null, user: null, isAuthenticated: false, loading: false });
        }

        const { data: authListener } = supabase.auth.onAuthStateChange(
          async (_event, session) => {
            if (session) {
              const { data: profileData } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', session.user.id)
                .single();
              set({
                session,
                user: profileData ? { ...profileData, email: session.user.email } : { id: session.user.id, email: session.user.email },
                isAuthenticated: true,
                loading: false,
              });
            } else {
              set({ session: null, user: null, isAuthenticated: false, loading: false });
            }
          }
        );
        // Consider returning authListener.subscription.unsubscribe for cleanup if needed elsewhere
      },

      loginWithPassword: async (email, password) => {
        set({ loading: true });
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          set({ loading: false });
          throw error;
        }
        if (data.session && data.user) {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .single();
          set({
            session: data.session,
            user: profileData ? { ...profileData, email: data.user.email } : { id: data.user.id, email: data.user.email },
            isAuthenticated: true,
            loading: false,
          });
        } else {
           set({ loading: false });
        }
      },

      signupWithPassword: async (email, password, fullName) => {
        set({ loading: true });
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName, // This goes into raw_user_meta_data for the trigger
            },
          },
        });
        if (error) {
          set({ loading: false });
          throw error;
        }
        // The onAuthStateChange listener and trigger should handle setting the user profile
        // Or you can explicitly set it here if the session is immediately available
        if (data.session && data.user) {
             const { data: profileData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .single();
          set({
            session: data.session,
            user: profileData ? { ...profileData, email: data.user.email } : { id: data.user.id, email: data.user.email },
            isAuthenticated: true,
            loading: false,
          });
        } else {
            // User might need to confirm email
            set({ loading: false });
        }
      },

      logout: async () => {
        set({ loading: true });
        const { error } = await supabase.auth.signOut();
        if (error) {
          set({ loading: false });
          throw error;
        }
        // onAuthStateChange will handle clearing session and user
        set({ user: null, session: null, isAuthenticated: false, loading: false });
      },
      setSession: (session) => { // If you need to manually sync session from _layout
         if (session) {
            const { data: profileData } = supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single()
            .then(({data: profileData}) => {
                set({
                    session,
                    user: profileData ? { ...profileData, email: session.user.email } : { id: session.user.id, email: session.user.email },
                    isAuthenticated: true,
                    loading: false,
                  });
            });
        } else {
            set({ session: null, user: null, isAuthenticated: false, loading: false });
        }
      }
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ session: state.session }), // Only persist session
    }
  )
);

// Call initializeAuth when the app loads (e.g., in your root layout)
// useAuthStore.getState().initializeAuth(); // Or do it in a useEffect in _layout.tsx