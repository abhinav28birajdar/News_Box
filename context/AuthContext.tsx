// context/AuthContext.tsx
import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { User } from 'firebase/auth';
import { auth, db } from '../firebaseConfig'; // Adjust path if needed
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { Alert } from 'react-native';

// Define a Profile interface for user data stored in Firestore
interface Profile {
  id: string;
  username: string;
  avatar_url?: string | null;
}

interface AuthContextProps {
  user: User | null;
  profile: Profile | null;
  loadingInitial: boolean;
  loadingAuthAction: boolean;
  signInWithPassword: (email: string, password: string) => Promise<boolean>;
  signUpWithPassword: (email: string, password: string, username: string) => Promise<boolean>;
  signOut: () => Promise<void>;
  fetchProfile: (userId: string) => Promise<void>;
  updateUserProfile: (updates: Partial<Profile>) => Promise<boolean>;
}

// Create the context remains the same
const AuthContext = createContext<AuthContextProps | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [loadingAuthAction, setLoadingAuthAction] = useState(false);

  const fetchProfile = async (userId: string | undefined) => {
    if (!userId) {
      setProfile(null);
      return;
    }
    try {
      const docRef = doc(db, "profiles", userId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setProfile({ id: docSnap.id, ...docSnap.data() } as Profile);
      } else {
        console.log("No such profile document!");
        setProfile(null);
      }
    } catch (e: any) {
      console.error("Error fetching profile:", e);
      setProfile(null);
    }
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        await fetchProfile(currentUser.uid);
      } else {
        setProfile(null);
      }
      setLoadingInitial(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithPassword = async (email: string, password: string): Promise<boolean> => {
    setLoadingAuthAction(true);
    try {
      await auth.signInWithEmailAndPassword(email, password);
      return true;
    } catch (error: any) {
      Alert.alert("Sign In Failed", error.message);
      return false;
    } finally {
      setLoadingAuthAction(false);
    }
  };

  const signUpWithPassword = async (email: string, password: string, username: string): Promise<boolean> => {
    setLoadingAuthAction(true);
    try {
      const userCredential = await auth.createUserWithEmailAndPassword(email, password);
      if (userCredential.user) {
        await setDoc(doc(db, "profiles", userCredential.user.uid), {
          username: username,
          avatar_url: null,
        });
        Alert.alert("Sign Up Successful", "Account created!");
        return true;
      }
      return false;
    } catch (error: any) {
      Alert.alert("Sign Up Failed", error.message);
      return false;
    } finally {
      setLoadingAuthAction(false);
    }
  };

  const signOut = async () => {
    setLoadingAuthAction(true);
    try {
      await auth.signOut();
      Alert.alert("Signed Out", "You have been signed out.");
    } catch (error: any) {
      Alert.alert("Sign Out Failed", error.message);
    } finally {
      setLoadingAuthAction(false);
    }
  };

  const updateUserProfile = async (updates: Partial<Profile>): Promise<boolean> => {
    if (!user) {
      Alert.alert("Error", "You must be logged in to update your profile.");
      return false;
    }
    setLoadingAuthAction(true);
    try {
      const docRef = doc(db, "profiles", user.uid);
      await updateDoc(docRef, updates);
      await fetchProfile(user.uid); // Re-fetch profile to update context
      Alert.alert("Profile Updated", "Your profile has been updated.");
      return true;
    } catch (error: any) {
      Alert.alert("Profile Update Failed", error.message);
      return false;
    } finally {
      setLoadingAuthAction(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loadingInitial,
        loadingAuthAction,
        signInWithPassword,
        signUpWithPassword,
        signOut,
        fetchProfile,
        updateUserProfile,
      }}
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