/**
 * Utility function to complete a match and clear active state
 * Call this when cafe calculation is finished
 */

import {
  clearMatchActive,
  type MatchHistoryItem,
} from "./local-storage";
import { createMatchFromHistory } from "@/lib/firebase/matches";
import { updateMultiplePlayerStats } from "@/lib/firebase/players";

export interface CompleteMatchInput {
  matchType: "Đơn" | "Đôi";
  team1: string[]; // Array of user names (from user.name field)
  team2: string[]; // Array of user names (from user.name field)
  score: string; // Format: "11-8" or "9-11"
  startTime: string; // Format: "hh:mm"
}

export async function completeMatch(matchData: CompleteMatchInput): Promise<void> {
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

  // Save to Firestore
  console.log("💾 Saving match to Firestore:", matchHistoryItem);
  try {
    const matchId = await createMatchFromHistory(matchHistoryItem);
    console.log("✅ Match saved successfully with ID:", matchId);
  } catch (error) {
    console.error("❌ Error saving match to Firestore:", error);
    if (error instanceof Error) {
      console.error("   Error message:", error.message);
      console.error("   Error code:", (error as { code?: string }).code);
    }
    throw error;
  }

  // Update player stats (wins/losses)
  console.log("📊 Updating player stats...");
  console.log("   Winners:", player_win);
  console.log("   Losers:", player_lose);
  try {
    const statUpdates = [
      ...player_win.map((name) => ({
        playerName: name,
        incrementWins: 1,
        incrementLosses: 0,
      })),
      ...player_lose.map((name) => ({
        playerName: name,
        incrementWins: 0,
        incrementLosses: 1,
      })),
    ];

    console.log("   Stat updates:", statUpdates);
    await updateMultiplePlayerStats(statUpdates);
    console.log("✅ Player stats updated successfully");
  } catch (error) {
    console.error("❌ Error updating player stats:", error);
    if (error instanceof Error) {
      console.error("   Error message:", error.message);
      console.error("   Error code:", (error as { code?: string }).code);
    }
    // Don't throw - match is already saved, stats update can fail silently or retry later
  }

  // Clear active match state
  clearMatchActive();
}

