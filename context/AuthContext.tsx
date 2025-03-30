// context/AuthContext.tsx
import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase, getProfile, Profile, updateProfile } from '@/lib/supabase'; // Adjust path if needed
import { Alert } from 'react-native';

// Interface for the context value remains the same
interface AuthContextProps {
  session: Session | null;
  user: User | null;
  profile: Profile | null; // Profile data from the 'profiles' table
  loadingInitial: boolean; // Loading state for initial session/profile fetch
  loadingAuthAction: boolean; // Loading state for sign-in/up/out/update actions
  signInWithPassword: (email: string, password: string) => Promise<boolean>;
  signUpWithPassword: (email: string, password: string, username: string) => Promise<boolean>;
  signOut: () => Promise<void>;
  fetchProfile: (userId: string) => Promise<void>; // Function to explicitly fetch profile
  updateUserProfile: (updates: Partial<Profile>) => Promise<boolean>; // Function to update profile
}

// Create the context remains the same
const AuthContext = createContext<AuthContextProps | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [loadingAuthAction, setLoadingAuthAction] = useState(false);

  // Fetches profile data for a given user ID and updates the context state
  // Renamed internally to avoid conflict with the exported key name
  const fetchUserProfileInternal = async (userId: string | undefined) => {
      if (!userId) {
        setProfile(null); // Clear profile if no user ID
        return;
      }
      try {
          console.log(`AuthContext: Fetching profile for user ${userId}`);
          const profileData = await getProfile(userId);
          console.log(`AuthContext: Profile data received for ${userId}:`, profileData);
          setProfile(profileData);
      } catch (e: any) {
          console.error("AuthContext: Failed to fetch profile:", e?.message);
          setProfile(null); // Reset profile on error
      }
  };

  // Effect to handle initial session loading and auth state changes
  useEffect(() => {
    setLoadingInitial(true);
    console.log("AuthContext: useEffect - Subscribing to auth changes and fetching initial session.");

    // Fetch initial session on mount
    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      console.log("AuthContext: Initial getSession completed.", initialSession ? `Session found for ${initialSession.user.id}` : "No initial session.");
      setSession(initialSession);
      const initialUser = initialSession?.user ?? null;
      setUser(initialUser);
      // Fetch profile only if there's an initial user
      if (initialUser) {
        fetchUserProfileInternal(initialUser.id).finally(() => { // Use internal name
           setLoadingInitial(false);
           console.log("AuthContext: Initial profile fetch attempt complete.");
        });
      } else {
          setLoadingInitial(false);
          console.log("AuthContext: No initial user, initial loading complete.");
      }
    }).catch(err => {
        console.error("AuthContext: Error fetching initial session:", err);
        setLoadingInitial(false);
    });

    // Subscribe to auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (_event, currentSession) => {
        console.log(`AuthContext: onAuthStateChange event: ${_event}`, currentSession ? `Session received for ${currentSession.user.id}` : "Session cleared/null.");
        const previousUserId = user?.id;
        const currentUser = currentSession?.user ?? null;
        const newUserId = currentUser?.id;

        setSession(currentSession);
        setUser(currentUser);

        if (newUserId !== previousUserId) {
            console.log(`AuthContext: User changed (${previousUserId} -> ${newUserId}), fetching profile.`);
            await fetchUserProfileInternal(newUserId); // Use internal name
        } else if (newUserId && !profile && _event === "SIGNED_IN") {
            console.log(`AuthContext: SIGNED_IN event, attempting profile fetch for ${newUserId}`);
            await fetchUserProfileInternal(newUserId); // Use internal name
        }
         if (loadingInitial) setLoadingInitial(false);
      }
    );

    // Cleanup function
    return () => {
      console.log("AuthContext: useEffect cleanup - Unsubscribing auth listener.");
      authListener?.subscription?.unsubscribe();
    };
     // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  const signInWithPassword = async (email: string, password: string): Promise<boolean> => {
    setLoadingAuthAction(true);
    console.log(`AuthContext: Attempting sign in for ${email}`);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
          console.error("AuthContext: Sign in error response:", error);
          throw error;
      }
      console.log(`AuthContext: Sign in successful for ${email}. Auth listener will handle state update.`);
      setLoadingAuthAction(false);
      return true;
    } catch (error: any) {
      console.error("AuthContext: Sign in function caught error:", error);
      Alert.alert('Sign In Failed', error.message || 'Could not sign in.');
      setLoadingAuthAction(false);
      return false;
    }
  };

  const signUpWithPassword = async (email: string, password: string, username: string): Promise<boolean> => {
    setLoadingAuthAction(true);
    console.log(`AuthContext: Attempting sign up for ${email} with username ${username}`);
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        // options: { data: { username: username } } // Only if trigger needs it
      });

      if (authError) {
        console.error("AuthContext: Sign up auth error response:", authError);
        throw authError;
      }
      if (!authData.user) {
        console.error("AuthContext: Sign up successful but no user data returned.");
        throw new Error('Sign up successful but no user data returned.');
      }

      console.log(`AuthContext: User ${authData.user.id} created successfully in auth.users.`);
      console.log("AuthContext: Database trigger 'on_auth_user_created' should now be creating the profile.");

      // ** Profile insertion is handled by the DB trigger **

      // Update local state optimistically
      // Ensure 'Profile' type includes 'id' if using it here
      setProfile({ id: authData.user.id, username: username, avatar_url: null } as Profile); // Type assertion might still be needed depending on Profile definition
      setSession(authData.session);
      setUser(authData.user);

      const requiresConfirmation = !authData.user.email_confirmed_at;
       if (requiresConfirmation) {
          Alert.alert('Sign Up Successful', 'Please check your email to verify your account before signing in.');
       } else {
          Alert.alert('Sign Up Successful', 'Your account has been created.');
       }

      console.log(`AuthContext: Sign up process complete for ${email}.`);
      setLoadingAuthAction(false);
      return true;

    } catch (error: any) {
      console.error("AuthContext: Sign up function caught error:", error);
      Alert.alert('Sign Up Failed', error.message || 'Could not sign up.');
      setLoadingAuthAction(false);
      return false;
    }
  };

  const signOut = async () => {
    setLoadingAuthAction(true);
    console.log("AuthContext: Attempting sign out.");
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
          console.error("AuthContext: Sign out error response:", error);
          throw error;
      }
      console.log("AuthContext: Sign out successful. Clearing local state.");
      setSession(null);
      setUser(null);
      setProfile(null);
    } catch (error: any) {
      console.error("AuthContext: Sign out function caught error:", error);
      Alert.alert('Sign Out Failed', error.message || 'Could not sign out.');
      setSession(null);
      setUser(null);
      setProfile(null);
    } finally {
      setLoadingAuthAction(false);
    }
  };

 const updateUserProfile = async (updates: Partial<Profile>): Promise<boolean> => {
    if (!user) {
        console.warn("AuthContext: updateUserProfile called but no user logged in.");
        Alert.alert("Error", "You must be logged in to update your profile.");
        return false;
    }
    setLoadingAuthAction(true);
    console.log(`AuthContext: Attempting to update profile for user ${user.id} with updates:`, updates);
    try {
        const success = await updateProfile(user.id, updates);
        if (success) {
            console.log(`AuthContext: Profile update successful in DB for ${user.id}. Fetching updated profile.`);
            await fetchUserProfileInternal(user.id); // Use internal name
        } else {
             console.warn(`AuthContext: updateProfile helper returned false for user ${user.id}.`);
        }
        return success;
    } catch (error: any) {
        console.error("AuthContext: Error during updateUserProfile call:", error);
        return false;
    } finally {
        setLoadingAuthAction(false);
    }
 };


  // Provide the context value to consuming components
  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        profile,
        loadingInitial,
        loadingAuthAction,
        signInWithPassword,
        signUpWithPassword,
        signOut,
        // *** FIX: Explicitly assign the internal function to the context key ***
        fetchProfile: (id: string) => fetchUserProfileInternal(id),
        updateUserProfile,
      }} // Line 288 where the fix is applied
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to easily consume the Auth context
export const useAuth = (): AuthContextProps => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};