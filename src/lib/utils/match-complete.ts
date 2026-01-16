/**
 * Utility function to complete a match and clear active state
 * Call this when cafe calculation is finished
 */

import {
  clearMatchActive,
  addToMatchHistory,
  type MatchHistoryItem,
} from "./local-storage";

export interface CompleteMatchInput {
  matchType: "Đơn" | "Đôi";
  team1: string[]; // Array of user names (from user.name field)
  team2: string[]; // Array of user names (from user.name field)
  score: string; // Format: "11-8" or "9-11"
  startTime: string; // Format: "hh:mm"
}

export function completeMatch(matchData: CompleteMatchInput): void {
  const today = new Date().toISOString().split("T")[0];
  
  // Parse score to determine winner and loser
  const [score1, score2] = matchData.score.split("-").map(Number);
  
  let player_win: string[];
  let player_lose: string[];
  
  if (score1 > score2) {
    // Team 1 wins
    player_win = matchData.team1;
    player_lose = matchData.team2;
  } else if (score2 > score1) {
    // Team 2 wins
    player_win = matchData.team2;
    player_lose = matchData.team1;
  } else {
    // Edge case: tie (shouldn't happen in table tennis, but handle it)
    // In case of tie, we'll consider team1 as winner (or you can handle differently)
    player_win = matchData.team1;
    player_lose = matchData.team2;
  }
  
  const matchHistoryItem: MatchHistoryItem = {
    id: `match_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    matchType: matchData.matchType,
    team1: matchData.team1,
    team2: matchData.team2,
    score: matchData.score,
    startTime: matchData.startTime,
    date: today,
    completedAt: new Date().toISOString(),
    player_win,
    player_lose,
  };

  // Add to history
  addToMatchHistory(matchHistoryItem);

  // Clear active match state
  clearMatchActive();
}

