import { NextRequest, NextResponse } from "next/server";
import type { MatchHistoryItem } from "@/lib/utils/local-storage";
import {
  prepareCafeCalculation,
  validateAIResponse,
  type CafeCalculationResult,
} from "@/lib/utils/cafe-calculation";

const MITRAL_AI_API_URL = "https://api.mistral.ai/v1/chat/completions";

interface MitralAIRequest {
  model?: string;
  messages: Array<{
    role: "system" | "user" | "assistant";
    content: string;
  }>;
  temperature?: number;
  max_tokens?: number;
}

interface MitralAIResponse {
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

export async function POST(request: NextRequest) {
  try {
    // Get API key from server-side environment variable (no NEXT_PUBLIC_ prefix)
    const apiKey = process.env.MISTRAL_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "MISTRAL_API_KEY is not configured on server" },
        { status: 500 }
      );
    }

    // Parse request body
    const body = await request.json();
    const matches: MatchHistoryItem[] = body.matches;

    if (!matches || !Array.isArray(matches)) {
      return NextResponse.json(
        { error: "Invalid request: matches array is required" },
        { status: 400 }
      );
    }

    // STEP 1: Prepare cafe calculation using prepareCafeCalculation
    const { balancePayload, prompt, metadata } = prepareCafeCalculation(matches);

    console.log("📊 Balance payload:", balancePayload);
    console.log("📝 Prompt:", prompt);

    // Prepare request with system message to ensure JSON-only response
    const requestBody: MitralAIRequest = {
      model: "mistral-large-latest",
      messages: [
        {
          role: "system",
          content: "You are a JSON-only API. You MUST respond with ONLY valid JSON, no explanations, no markdown, no text before or after. Your response must start with { and end with }.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.3,
      max_tokens: 2000,
    };

    // Call Mistral AI API
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
      console.error("Mistral AI API error:", response.status, errorText);
      return NextResponse.json(
        { error: `AI API error: ${response.status}` },
        { status: response.status }
      );
    }

    const data = (await response.json()) as MitralAIResponse;

    // Extract content from response
    const content = data.choices[0]?.message?.content;
    if (!content) {
      return NextResponse.json(
        { error: "No content in AI response" },
        { status: 500 }
      );
    }

    // STEP 2: Parse JSON from AI response
    let parsed: unknown;
    try {
      // Try to parse directly first
      parsed = JSON.parse(content);
    } catch (parseError) {
      // If direct parse fails, try to extract JSON from text
      let cleaned = content.trim();

      // Remove markdown code blocks if present
      if (cleaned.startsWith("```")) {
        cleaned = cleaned
          .replace(/^```(?:json)?\n?/g, "")
          .replace(/\n?```$/g, "")
          .trim();
      }

      // Try to find JSON object by looking for balanced braces
      const firstBrace = cleaned.indexOf("{");
      if (firstBrace === -1) {
        console.error("Could not find JSON in AI response:", content);
        return NextResponse.json(
          { error: "AI response does not contain valid JSON" },
          { status: 500 }
        );
      }

      // Find the matching closing brace
      let braceCount = 0;
      let lastBrace = -1;
      for (let i = firstBrace; i < cleaned.length; i++) {
        if (cleaned[i] === "{") braceCount++;
        if (cleaned[i] === "}") {
          braceCount--;
          if (braceCount === 0) {
            lastBrace = i;
            break;
          }
        }
      }

      if (lastBrace === -1 || lastBrace <= firstBrace) {
        console.error("Could not extract JSON from AI response:", content);
        return NextResponse.json(
          { error: "AI response does not contain valid JSON" },
          { status: 500 }
        );
      }

      const jsonString = cleaned.substring(firstBrace, lastBrace + 1);
      try {
        parsed = JSON.parse(jsonString);
      } catch (extractParseError) {
        console.error("Failed to parse extracted JSON:", jsonString);
        console.error("Original content:", content);
        console.error("Parse error:", extractParseError);
        return NextResponse.json(
          { error: "AI returned invalid JSON format" },
          { status: 500 }
        );
      }
    }

    // STEP 3: Validate response
    if (!validateAIResponse(parsed)) {
      console.error("Invalid AI response format:", parsed);
      return NextResponse.json(
        { error: "Invalid AI response format" },
        { status: 500 }
      );
    }

    const result = parsed as CafeCalculationResult;
    console.log("✅ Success! Final cafe results:", result.cafeResults);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error in AI calculation API:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}

