/**
 * Security utilities for Firebase Auth
 * Prevents token exposure and ensures secure token handling
 */

import { auth } from "./auth";

/**
 * Get user ID token securely
 * This should only be used when absolutely necessary (e.g., server-side API calls)
 * Never log or expose the token
 */
export async function getSecureIdToken(): Promise<string | null> {
  try {
    const user = auth.currentUser;
    if (!user) {
      return null;
    }

    // Get ID token - this is secure as long as we don't log it
    const token = await user.getIdToken();
    return token;
  } catch (error) {
    console.error("Error getting ID token:", error);
    return null;
  }
}

/**
 * Sanitize user object to remove sensitive data before logging
 */
export function sanitizeUserForLogging(user: unknown): Record<string, unknown> {
  if (!user || typeof user !== "object") {
    return {};
  }

  const sanitized: Record<string, unknown> = {};
  const userObj = user as Record<string, unknown>;

  // Only include safe fields
  if (userObj.uid) sanitized.uid = userObj.uid;
  if (userObj.email) sanitized.email = userObj.email;
  if (userObj.displayName) sanitized.displayName = userObj.displayName;
  if (userObj.photoURL) sanitized.photoURL = userObj.photoURL;

  // Explicitly exclude sensitive fields
  // Do NOT include: accessToken, refreshToken, stsTokenManager, etc.

  return sanitized;
}

/**
 * Check if we're in a secure context (HTTPS or localhost)
 */
export function isSecureContext(): boolean {
  if (typeof window === "undefined") {
    return true; // Server-side is always secure
  }

  return (
    window.location.protocol === "https:" ||
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1"
  );
}

