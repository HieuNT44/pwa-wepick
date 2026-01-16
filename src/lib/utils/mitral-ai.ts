/**
 * Mitral AI API utilities
 */

import type { MatchHistoryItem } from "./local-storage";
import {
  generateCafeCalculationPrompt,
  validateAIResponse,
  type CafeCalculationResult,
} from "./cafe-calculation";

// Get API key from environment variable
// Use NEXT_PUBLIC_ prefix for client-side access in Next.js
const getMistralApiKey = (): string => {
  // In Next.js, client-side code can only access NEXT_PUBLIC_ prefixed env vars
  const apiKey = process.env.NEXT_PUBLIC_MISTRAL_API_KEY;
  if (!apiKey) {
    throw new Error(
      "NEXT_PUBLIC_MISTRAL_API_KEY is not set in environment variables. Please add it to your .env.local file."
    );
  }
  return apiKey;
};

const MITRAL_AI_API_URL = "https://api.mistral.ai/v1/chat/completions"; // Mistral AI API URL

export interface MitralAIRequest {
  model?: string;
  messages: Array<{
    role: "system" | "user" | "assistant";
    content: string;
  }>;
  temperature?: number;
  max_tokens?: number;
}

export interface MitralAIResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

/**
 * Call Mitral AI API to calculate cafe results
 */
export async function callMitralAI(
  matches: MatchHistoryItem[]
): Promise<CafeCalculationResult> {
  try {
    // Generate prompt
    const prompt = generateCafeCalculationPrompt(matches);

    // Prepare request
    const requestBody: MitralAIRequest = {
      model: "mistral-large-latest", // Mistral AI model
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.3, // Lower temperature for more consistent results
      max_tokens: 2000,
    };

    // Get API key
    const apiKey = getMistralApiKey();

    // Call API
    const response = await fetch(MITRAL_AI_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Mitral AI API error: ${response.status} - ${errorText}`
      );
    }

    const data = (await response.json()) as MitralAIResponse;

    // Extract content from response
    const content = data.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No content in AI response");
    }

    // Try to extract JSON from response (AI might return JSON wrapped in markdown)
    let jsonString = content.trim();

    // Remove markdown code blocks if present
    if (jsonString.startsWith("```")) {
      jsonString = jsonString.replace(/^```(?:json)?\n?/g, "").replace(/\n?```$/g, "");
    }

    // Parse JSON
    const parsed = JSON.parse(jsonString) as unknown;

    // Validate response
    if (!validateAIResponse(parsed)) {
      throw new Error("Invalid AI response format");
    }

    return parsed;
  } catch (error) {
    console.error("Error calling Mitral AI:", error);
    throw error;
  }
}

