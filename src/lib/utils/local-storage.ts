/**
 * LocalStorage utilities for match history and match state
 */

const STORAGE_KEYS = {
  TODAY_MATCH_HISTORY: "wepick_today_match_history",
  IS_MATCH_ACTIVE: "wepick_is_match_active",
  CURRENT_MATCH: "wepick_current_match",
  CAFE_CALCULATION_RESULTS: "wepick_cafe_calculation_results",
} as const;

// Match History
export interface MatchHistoryItem {
  id: string;
  matchType: "Đơn" | "Đôi";
  team1: string[]; // Array of user names (from user.name field)
  team2: string[]; // Array of user names (from user.name field)
  score: string; // Format: "11-8" or "9-11"
  startTime: string; // Format: "hh:mm"
  date: string; // Format: "YYYY-MM-DD"
  completedAt: string;
  createdAt?: string; // ISO string - when match was created in Firestore
  player_win: string[]; // Array of user names who won (from user.name field)
  player_lose: string[]; // Array of user names who lost (from user.name field)
}

export const getTodayMatchHistory = (): MatchHistoryItem[] => {
  if (typeof window === "undefined") return [];

  try {
    const today = new Date().toISOString().split("T")[0];
    const stored = localStorage.getItem(STORAGE_KEYS.TODAY_MATCH_HISTORY);
    if (!stored) return [];

    const history = JSON.parse(stored) as MatchHistoryItem[];
    // Filter only today's matches
    return history.filter((match) => match.date === today);
  } catch (error) {
    console.error("Error reading match history:", error);
    return [];
  }
};

export const addToMatchHistory = (match: MatchHistoryItem): void => {
  if (typeof window === "undefined") return;

  try {
    const today = new Date().toISOString().split("T")[0];

    // Get all history from localStorage
    const stored = localStorage.getItem(STORAGE_KEYS.TODAY_MATCH_HISTORY);
    let allHistory: MatchHistoryItem[] = [];

    if (stored) {
      try {
        allHistory = JSON.parse(stored) as MatchHistoryItem[];
      } catch (parseError) {
        console.error("Error parsing match history:", parseError);
        allHistory = [];
      }
    }

    // Filter out old matches (not today) and keep only today's matches
    const todayHistory = allHistory.filter((m) => m.date === today);

    // Add new match
    todayHistory.push(match);

    // Save only today's matches back to localStorage
    localStorage.setItem(
      STORAGE_KEYS.TODAY_MATCH_HISTORY,
      JSON.stringify(todayHistory)
    );
  } catch (error) {
    console.error("Error saving match history:", error);
  }
};

export const clearTodayMatchHistory = (): void => {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEYS.TODAY_MATCH_HISTORY);
};

// Delete a specific match by ID
export const deleteMatchById = (matchId: string): void => {
  if (typeof window === "undefined") return;

  try {
    const today = new Date().toISOString().split("T")[0];

    // Get all history from localStorage
    const stored = localStorage.getItem(STORAGE_KEYS.TODAY_MATCH_HISTORY);
    if (!stored) return;

    let allHistory: MatchHistoryItem[] = [];
    try {
      allHistory = JSON.parse(stored) as MatchHistoryItem[];
    } catch (parseError) {
      console.error("Error parsing match history:", parseError);
      return;
    }

    // Filter out old matches (not today) and keep only today's matches
    const todayHistory = allHistory.filter((m) => m.date === today);

    // Remove match by ID
    const filteredHistory = todayHistory.filter((m) => m.id !== matchId);

    // Save back to localStorage
    localStorage.setItem(
      STORAGE_KEYS.TODAY_MATCH_HISTORY,
      JSON.stringify(filteredHistory)
    );
  } catch (error) {
    console.error("Error deleting match:", error);
  }
};

// Match Active State
export const setIsMatchActive = (isActive: boolean): void => {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEYS.IS_MATCH_ACTIVE, JSON.stringify(isActive));
};

export const getIsMatchActive = (): boolean => {
  if (typeof window === "undefined") return false;

  try {
    const stored = localStorage.getItem(STORAGE_KEYS.IS_MATCH_ACTIVE);
    return stored ? JSON.parse(stored) : false;
  } catch (error) {
    console.error("Error reading match active state:", error);
    return false;
  }
};

export const clearMatchActive = (): void => {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEYS.IS_MATCH_ACTIVE);
  localStorage.removeItem(STORAGE_KEYS.CURRENT_MATCH);
};

// Current Match
export interface CurrentMatch {
  matchId: string;
  startedAt: string;
}

export const setCurrentMatch = (match: CurrentMatch): void => {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEYS.CURRENT_MATCH, JSON.stringify(match));
};

export const getCurrentMatch = (): CurrentMatch | null => {
  if (typeof window === "undefined") return null;

  try {
    const stored = localStorage.getItem(STORAGE_KEYS.CURRENT_MATCH);
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.error("Error reading current match:", error);
    return null;
  }
};

// Cafe Calculation Results
export interface CafeCalculationHistoryItem {
  id: string;
  date: string; // Format: "YYYY-MM-DD"
  calculatedAt: string; // ISO string
  result: {
    date: string;
    totalSingleMatches: number;
    totalDoubleMatches: number;
    cafeResults: Array<{
      playerLose: string;
      playerWin: string;
      amount: number;
    }>;
  };
}

export const saveCafeCalculation = (
  result: CafeCalculationHistoryItem["result"]
): void => {
  if (typeof window === "undefined") return;

  try {
    const stored = localStorage.getItem(STORAGE_KEYS.CAFE_CALCULATION_RESULTS);
    let allResults: CafeCalculationHistoryItem[] = stored
      ? (JSON.parse(stored) as CafeCalculationHistoryItem[])
      : [];

    // Remove existing result for the same date
    allResults = allResults.filter((item) => item.date !== result.date);

    // Add new result
    const newItem: CafeCalculationHistoryItem = {
      id: `cafe_calc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      date: result.date,
      calculatedAt: new Date().toISOString(),
      result,
    };

    allResults.push(newItem);

    // Sort by date (newest first)
    allResults.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    localStorage.setItem(
      STORAGE_KEYS.CAFE_CALCULATION_RESULTS,
      JSON.stringify(allResults)
    );
  } catch (error) {
    console.error("Error saving cafe calculation:", error);
  }
};

export const getCafeCalculationByDate = (
  date: string
): CafeCalculationHistoryItem | null => {
  if (typeof window === "undefined") return null;

  try {
    const stored = localStorage.getItem(STORAGE_KEYS.CAFE_CALCULATION_RESULTS);
    if (!stored) return null;

    const allResults = JSON.parse(stored) as CafeCalculationHistoryItem[];
    return allResults.find((item) => item.date === date) || null;
  } catch (error) {
    console.error("Error reading cafe calculation:", error);
    return null;
  }
};

export const getTodayCafeCalculation =
  (): CafeCalculationHistoryItem | null => {
    const today = new Date().toISOString().split("T")[0];
    return getCafeCalculationByDate(today);
  };
