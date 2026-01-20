/**
 * Example usage of cafe calculation prompt
 * 
 * This file demonstrates how to use the AI prompt for calculating cafe results
 */

import { getTodayMatchHistory } from "./local-storage";
import {
  prepareCafeCalculation,
  validateAIResponse,
  type CafeCalculationResult,
} from "./cafe-calculation";

/**
 * Example: How to prepare data and generate prompt for AI
 */
export function exampleGeneratePrompt() {
  // 1. Get today's matches from localStorage
  const matches = getTodayMatchHistory();

  // 2. Prepare cafe calculation (calculates balances and generates prompt)
  const { prompt, balancePayload, metadata } = prepareCafeCalculation(matches);

  console.log("=== PROMPT FOR AI ===");
  console.log(prompt);

  return prompt;
}

/**
 * Example: How to process AI response
 */
export function exampleProcessAIResponse(aiResponseText: string) {
  try {
    // 1. Parse AI response (assuming it's JSON)
    const response = JSON.parse(aiResponseText) as unknown;

    // 2. Validate response format
    if (!validateAIResponse(response)) {
      throw new Error("Invalid AI response format");
    }

    // 3. Use the validated result
    const result: CafeCalculationResult = response;

    console.log("=== CAFE CALCULATION RESULT ===");
    console.log(`Date: ${result.date}`);
    console.log(`Tổng số trận đơn: ${result.totalSingleMatches}`);
    console.log(`Tổng số trận đôi: ${result.totalDoubleMatches}`);
    console.log("Kết quả cafe:");
    result.cafeResults.forEach((transaction) => {
      console.log(
        `  ${transaction.playerLose} → ${transaction.playerWin}: ${transaction.amount} cốc`
      );
    });

    return result;
  } catch (error) {
    console.error("Error processing AI response:", error);
    throw error;
  }
}

/**
 * Example: Complete flow from localStorage to AI and back
 */
export async function exampleCompleteFlow() {
  // Step 1: Get matches from localStorage
  const matches = getTodayMatchHistory();

  if (matches.length === 0) {
    console.log("Không có trận đấu nào hôm nay");
    return null;
  }

  // Step 2: Prepare cafe calculation and generate prompt
  const { prompt } = prepareCafeCalculation(matches);

  // Step 3: Send to AI (replace with your actual AI API call)
  // const aiResponse = await callAIAPI(prompt);
  
  // For example, here's what the AI should return:
  const exampleAIResponse = `{
    "date": "2024-01-15",
    "totalSingleMatches": 2,
    "totalDoubleMatches": 1,
    "cafeResults": [
      {
        "playerLose": "Hiếu Nguyễn",
        "playerWin": "Tuấn Phan",
        "amount": 2
      },
      {
        "playerLose": "Minh Trần",
        "playerWin": "Anh Đỗ",
        "amount": 1
      }
    ]
  }`;

  // Step 4: Process and validate AI response
  const result = exampleProcessAIResponse(exampleAIResponse);

  // Step 5: Save to database (implement your save logic here)
  // await saveCafeCalculationToDB(result);

  return result;
}

/**
 * Example AI response format (for reference)
 */
export const exampleAIResponse: CafeCalculationResult = {
  date: "2024-01-15",
  totalSingleMatches: 2,
  totalDoubleMatches: 1,
  cafeResults: [
    {
      playerLose: "Hiếu Nguyễn",
      playerWin: "Tuấn Phan",
      amount: 2,
    },
    {
      playerLose: "Minh Trần",
      playerWin: "Anh Đỗ",
      amount: 1,
    },
  ],
};

