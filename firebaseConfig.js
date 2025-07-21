import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

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

// Initialize Auth and Firestore
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
