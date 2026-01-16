import { getAnalytics, type Analytics } from "firebase/analytics";
import type { FirebaseOptions } from "firebase/app";
import { initializeApp, type FirebaseApp } from "firebase/app";

// Firebase configuration
const firebaseConfig: FirebaseOptions = {
  apiKey:
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY ||
    "AIzaSyBnWATM06T6VfwtNeVa0jtEdAfvkHzjVUg",
  authDomain:
    process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ||
    "we-pick-33fa3.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "we-pick-33fa3",
  storageBucket:
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ||
    "we-pick-33fa3.firebasestorage.app",
  messagingSenderId:
    process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "640032451054",
  appId:
    process.env.NEXT_PUBLIC_FIREBASE_APP_ID ||
    "1:640032451054:web:18d5a0f87e1bd3928206ff",
  measurementId:
    process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-K07CD32FY6",
};

// Initialize Firebase
let app: FirebaseApp;
let analytics: Analytics | null = null;

if (typeof window !== "undefined") {
  app = initializeApp(firebaseConfig);
  // Analytics only works in browser
  analytics = getAnalytics(app);
} else {
  // Server-side: initialize app without analytics
  app = initializeApp(firebaseConfig);
}

export { analytics, app };
export default app;
