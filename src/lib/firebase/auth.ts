import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, type User } from "firebase/auth";
import { app } from "./config";

export const auth = getAuth(app);

// Security: Configure auth persistence securely
// Note: Firebase Auth tokens are stored in localStorage/indexedDB by default
// This is necessary for authentication but we must ensure:
// 1. No token logging in console
// 2. Proper Content Security Policy
// 3. Secure HTTPS connections
if (typeof window !== "undefined") {
  // Set persistence to localStorage (default, but explicit for security)
  // This is secure as long as we don't expose tokens unnecessarily
  import("firebase/auth").then(({ setPersistence, browserLocalPersistence }) => {
    setPersistence(auth, browserLocalPersistence).catch(() => {
      // Ignore errors - fallback to default persistence
    });
  });

  // Security: Prevent token exposure in console
  // Override console methods in development to warn about token logging
  if (process.env.NODE_ENV === "development") {
    const originalLog = console.log;
    const originalError = console.error;
    
    console.log = (...args: unknown[]) => {
      const message = JSON.stringify(args);
      if (message.includes("token") || message.includes("Token") || message.includes("refreshToken")) {
        console.warn("⚠️ SECURITY WARNING: Attempted to log sensitive token data. This is not allowed.");
        return;
      }
      originalLog.apply(console, args);
    };
    
    console.error = (...args: unknown[]) => {
      const message = JSON.stringify(args);
      if (message.includes("token") || message.includes("Token") || message.includes("refreshToken")) {
        console.warn("⚠️ SECURITY WARNING: Attempted to log sensitive token data. This is not allowed.");
        return;
      }
      originalError.apply(console, args);
    };
  }
}

export const loginWithEmail = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { user: userCredential.user, error: null };
  } catch (error) {
    return { user: null, error: error as Error };
  }
};

export const signupWithEmail = async (email: string, password: string) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    return { user: userCredential.user, error: null };
  } catch (error) {
    return { user: null, error: error as Error };
  }
};

export const logout = async () => {
  try {
    await signOut(auth);
    return { error: null };
  } catch (error) {
    return { error: error as Error };
  }
};

