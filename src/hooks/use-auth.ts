"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { auth } from "@/lib/firebase/auth";

export function useAuth() {
  // Initialize with current user if available (immediate check)
  const [user, setUser] = useState<User | null>(() => {
    if (typeof window !== "undefined") {
      return auth.currentUser;
    }
    return null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // If we already have a user, set loading to false immediately
    if (auth.currentUser) {
      setUser(auth.currentUser);
      setLoading(false);
    }

    // Set up auth state listener
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    // Timeout fallback - if auth state doesn't resolve in 2 seconds, stop loading
    const timeoutId = setTimeout(() => {
      setLoading(false);
    }, 2000);

    return () => {
      unsubscribe();
      clearTimeout(timeoutId);
    };
  }, []);

  return { user, loading };
}

