import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

// Replace with your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDeWOVtw6vDyGGg5Gl3DjrhYQUY85JB95Q",
  authDomain: "newsbox-9bc3d.firebaseapp.com",
  projectId: "newsbox-9bc3d",
  storageBucket: "newsbox-9bc3d.firebasestorage.app",
  messagingSenderId: "738525083363",
  appId: "1:738525083363:web:c336af5ef3deed5473f7d6",
  measurementId: "G-HLMTTRYCHH" // Optional
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});
const db = getFirestore(app);

export { app, auth, db };
