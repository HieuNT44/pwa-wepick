/**
 * Cafe calculation utilities - Balance first, then AI optimizes
 */

import type { MatchHistoryItem } from "./local-storage";

/**
 * Interface for AI response
 */
export interface CafeCalculationResult {
  date: string;
  totalSingleMatches: number;
  totalDoubleMatches: number;
  cafeResults: Array<{
    playerLose: string;
    playerWin: string;
    amount: number;
  }>;
}

/**
 * Calculate player balances from matches
 * Returns simple object: { playerName: balance }
 */
export function calculatePlayerBalances(
  matches: MatchHistoryItem[]
): {
  balances: Record<string, number>;
  date: string;
  totalSingleMatches: number;
  totalDoubleMatches: number;
} {
  if (matches.length === 0) {
    return {
      balances: {},
      date: new Date().toISOString().split('T')[0],
      totalSingleMatches: 0,
      totalDoubleMatches: 0
    };
  }

  const balances: Record<string, number> = {};
  let totalSingleMatches = 0;
  let totalDoubleMatches = 0;

  matches.forEach(match => {
    // Count match types
    if (match.matchType === "Đơn") {
      totalSingleMatches++;
    } else if (match.matchType === "Đôi") {
      totalDoubleMatches++;
    }

    // Process wins and losses
    if (match.matchType === "Đơn") {
      // Single match
      const winner = match.player_win[0];
      const loser = match.player_lose[0];

      balances[winner] = (balances[winner] || 0) + 1;
      balances[loser] = (balances[loser] || 0) - 1;

    } else if (match.matchType === "Đôi") {
      // Double match - position based
      for (let i = 0; i < Math.min(match.player_win.length, match.player_lose.length); i++) {
        const winner = match.player_win[i];
        const loser = match.player_lose[i];

        balances[winner] = (balances[winner] || 0) + 1;
        balances[loser] = (balances[loser] || 0) - 1;
      }
    }
  });

  return {
    balances,
    date: matches[0].date,
    totalSingleMatches,
    totalDoubleMatches
  };
}

/**
 * Generate AI prompt with simple balance payload
 */
export function generateCafeCalculationPrompt(
  balances: Record<string, number>,
  date: string,
  totalSingleMatches: number,
  totalDoubleMatches: number
): string {
  // Convert to array format: [{name: number}, ...]
  const balanceArray = Object.entries(balances).map(([name, balance]) => ({
    [name]: balance
  }));

  const balanceJson = JSON.stringify(balanceArray, null, 2);

  return `Optimize coffee debt settlements between players.

PLAYER BALANCES:
${balanceJson}

Each number is net balance:
- Positive: player receives that many coffees
- Negative: player pays that many coffees
- Zero: no transaction needed

TASK: Minimize transactions using greedy matching algorithm.

ALGORITHM:
1. Separate into debtors (negative) and creditors (positive)
2. Sort debtors by amount (most negative first)
3. Sort creditors by amount (most positive first)
4. Match greedily:
   - Take first debtor + first creditor
   - Transfer = min(|debtor|, creditor)
   - Update both, remove if zero
   - Repeat until settled

EXAMPLE:
Input: [{"Anh": 7}, {"Hieu": -4}, {"Nhat": 3}, {"Thang": -4}, {"Tuan": -2}]

Debtors: Hieu(-4), Thang(-4), Tuan(-2)
Creditors: Anh(+7), Nhat(+3)

Matching:
1. Hieu pays Anh: 4 → Anh: 3 left, Hieu: 0
2. Thang pays Anh: 3 → Anh: 0, Thang: -1 left  
3. Thang pays Nhat: 1 → Thang: 0, Nhat: 2 left
4. Tuan pays Nhat: 2 → Tuan: 0, Nhat: 0

Output:
[
  {"playerLose": "Hieu", "playerWin": "Anh", "amount": 4},
  {"playerLose": "Thang", "playerWin": "Anh", "amount": 3},
  {"playerLose": "Thang", "playerWin": "Nhat", "amount": 1},
  {"playerLose": "Tuan", "playerWin": "Nhat", "amount": 2}
]

RULES:
- Skip players with balance = 0
- Sort output by playerLose, then playerWin (alphabetically)
- Sum of all balances must = 0
- All balances must = 0 after settlements

OUTPUT (JSON only, no markdown):
{
  "date": "${date}",
  "totalSingleMatches": ${totalSingleMatches},
  "totalDoubleMatches": ${totalDoubleMatches},
  "cafeResults": [
    {"playerLose": "name", "playerWin": "name", "amount": 0}
  ]
}`;
}

/**
 * MAIN WORKFLOW: Process matches and prepare for AI
 */
export function prepareCafeCalculation(matches: MatchHistoryItem[]): {
  balancePayload: Array<Record<string, number>>;
  prompt: string;
  metadata: {
    date: string;
    totalSingleMatches: number;
    totalDoubleMatches: number;
  };
} {
  const { balances, date, totalSingleMatches, totalDoubleMatches } = 
    calculatePlayerBalances(matches);

  // Convert to array format for payload
  const balancePayload = Object.entries(balances).map(([name, balance]) => ({
    [name]: balance
  }));

  const prompt = generateCafeCalculationPrompt(
    balances,
    date,
    totalSingleMatches,
    totalDoubleMatches
  );

  return {
    balancePayload, // This is what you send to AI
    prompt,
    metadata: { date, totalSingleMatches, totalDoubleMatches }
  };
}

/**
 * Validate AI response
 */
export function validateAIResponse(
  response: unknown
): response is CafeCalculationResult {
  if (!response || typeof response !== "object") {
    return false;
  }

  const result = response as Record<string, unknown>;

  if (
    typeof result.date !== "string" ||
    typeof result.totalSingleMatches !== "number" ||
    typeof result.totalDoubleMatches !== "number" ||
    !Array.isArray(result.cafeResults)
  ) {
    return false;
  }

  for (const transaction of result.cafeResults) {
    if (
      typeof transaction !== "object" ||
      typeof transaction.playerLose !== "string" ||
      typeof transaction.playerWin !== "string" ||
      typeof transaction.amount !== "number"
    ) {
      return false;
    }
  }

  return true;
}

/**
 * Legacy function - kept for compatibility
 */
export function formatMatchesForAI(
  matches: MatchHistoryItem[]
): MatchHistoryItem[] {
  return matches;
}