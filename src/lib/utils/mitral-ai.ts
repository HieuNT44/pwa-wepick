/**
 * Mitral AI API utilities - Client-side wrapper
 * This function calls our server-side API route to keep API key secure
 */

import type { MatchHistoryItem } from "./local-storage";
import type { CafeCalculationResult } from "./cafe-calculation";

/**
 * Call Mitral AI API to calculate cafe results
 * This now calls our server-side API route instead of calling Mistral AI directly
 */
export async function callMitralAI(
  matches: MatchHistoryItem[]
): Promise<CafeCalculationResult> {
  try {
    // Call our server-side API route instead of Mistral AI directly
    const response = await fetch("/api/ai/calculate-cafe", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ matches }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        error: "Unknown error",
      }));
      throw new Error(
        errorData.error || `API error: ${response.status}`
      );
    }

    const data = (await response.json()) as CafeCalculationResult;
    return data;
  } catch (error) {
    console.error("Error calling AI API:", error);
    throw error;
  }
}

