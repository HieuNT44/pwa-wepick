import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  type DocumentData,
} from "firebase/firestore";
import { db } from "./firebase";
import type { Match, CreateMatchInput, UpdateMatchInput } from "@/types/match";
import type { MatchHistoryItem } from "@/lib/utils/local-storage";

const COLLECTION_NAME = "matches";

// GET - Lấy tất cả matches
export const getAllMatches = async (): Promise<Match[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, COLLECTION_NAME));
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Match[];
  } catch (error) {
    console.error("Error getting matches:", error);
    throw error;
  }
};

// GET - Lấy matches theo ngày
export const getMatchesByDate = async (date: string): Promise<Match[]> => {
  try {
    // Format date to YYYY-MM-DD for query
    const dateStr = date.split("T")[0];
    // Only use where clause to avoid composite index requirement
    const q = query(
      collection(db, COLLECTION_NAME),
      where("date", "==", dateStr)
    );
    const querySnapshot = await getDocs(q);
    const matches = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Match[];
    
    // Sort by startTime descending in code (newest first)
    matches.sort((a, b) => {
      const timeA = (a as { startTime?: string }).startTime || (a as { time?: string }).time || "";
      const timeB = (b as { startTime?: string }).startTime || (b as { time?: string }).time || "";
      return timeB.localeCompare(timeA);
    });
    
    return matches;
  } catch (error) {
    console.error("Error getting matches by date:", error);
    throw error;
  }
};

// GET - Lấy matches hôm nay
export const getTodayMatches = async (): Promise<Match[]> => {
  try {
    const today = new Date();
    const todayStr = today.toISOString().split("T")[0];
    return await getMatchesByDate(todayStr);
  } catch (error) {
    console.error("Error getting today matches:", error);
    throw error;
  }
};

// GET - Lấy today's match history (MatchHistoryItem format)
// Filter by createdAt instead of date field
export const getTodayMatchHistory = async (): Promise<MatchHistoryItem[]> => {
  try {
    const today = new Date().toISOString().split("T")[0];
    
    // Get all matches and filter by createdAt in client-side to avoid composite index
    const allMatches = await getAllMatchesHistory();
    
    // Filter matches where createdAt date matches today
    const todayMatches = allMatches.filter((match) => {
      const matchCreatedAt = match.createdAt;
      if (!matchCreatedAt) return false;
      
      // Extract date part (YYYY-MM-DD) from createdAt ISO string
      const matchDateStr = new Date(matchCreatedAt).toISOString().split("T")[0];
      return matchDateStr === today;
    });
    
    // Sort by createdAt descending (newest first)
    todayMatches.sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    });
    
    return todayMatches;
  } catch (error) {
    console.error("Error getting today match history:", error);
    throw error;
  }
};

// POST - Tạo match từ MatchHistoryItem
export const createMatchFromHistory = async (
  matchData: MatchHistoryItem
): Promise<string> => {
  try {
    console.log("📡 Creating match in Firestore...");
    console.log("   Collection:", COLLECTION_NAME);
    console.log("   Match data:", matchData);

    const newMatch: DocumentData = {
      matchType: matchData.matchType,
      team1: matchData.team1,
      team2: matchData.team2,
      score: matchData.score,
      startTime: matchData.startTime,
      date: matchData.date,
      completedAt: matchData.completedAt,
      player_win: matchData.player_win,
      player_lose: matchData.player_lose,
      createdAt: matchData.completedAt,
      updatedAt: matchData.completedAt,
    };

    const docRef = await addDoc(collection(db, COLLECTION_NAME), newMatch);
    console.log("✅ Match created successfully with ID:", docRef.id);
    return docRef.id;
  } catch (error) {
    console.error("❌ Error creating match from history:", error);
    if (error instanceof Error) {
      console.error("   Error message:", error.message);
      console.error("   Error code:", (error as { code?: string }).code);
    }
    throw error;
  }
};

// DELETE - Xóa match theo ID (tương thích với deleteMatchById từ localStorage)
// Returns the match data before deletion for stats rollback
export const deleteMatchById = async (matchId: string): Promise<MatchHistoryItem | null> => {
  try {
    // Get match data before deletion
    const matchDoc = await getDoc(doc(db, COLLECTION_NAME, matchId));
    let matchData: MatchHistoryItem | null = null;
    
    if (matchDoc.exists()) {
      matchData = {
        id: matchDoc.id,
        ...matchDoc.data(),
      } as MatchHistoryItem;
    }

    // Delete the match
    const docRef = doc(db, COLLECTION_NAME, matchId);
    await deleteDoc(docRef);
    
    return matchData;
  } catch (error) {
    console.error("Error deleting match by ID:", error);
    throw error;
  }
};

// GET - Lấy match theo ID
export const getMatchById = async (matchId: string): Promise<Match | null> => {
  try {
    const docRef = doc(db, COLLECTION_NAME, matchId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data(),
      } as Match;
    }
    return null;
  } catch (error) {
    console.error("Error getting match:", error);
    throw error;
  }
};

// POST - Tạo match mới
export const createMatch = async (
  matchData: CreateMatchInput
): Promise<string> => {
  try {
    const newMatch: DocumentData = {
      ...matchData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const docRef = await addDoc(collection(db, COLLECTION_NAME), newMatch);
    return docRef.id;
  } catch (error) {
    console.error("Error creating match:", error);
    throw error;
  }
};

// PUT - Cập nhật match
export const updateMatch = async (
  matchData: UpdateMatchInput
): Promise<void> => {
  try {
    const { id, ...updateData } = matchData;
    const docRef = doc(db, COLLECTION_NAME, id);

    await updateDoc(docRef, {
      ...updateData,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error updating match:", error);
    throw error;
  }
};

// DELETE - Xóa match
export const deleteMatch = async (matchId: string): Promise<void> => {
  try {
    const docRef = doc(db, COLLECTION_NAME, matchId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error("Error deleting match:", error);
    throw error;
  }
};

// GET - Lấy tất cả matches với filter theo createdAt
export const getAllMatchesHistory = async (): Promise<MatchHistoryItem[]> => {
  try {
    // Get all matches without orderBy to avoid index requirement
    const querySnapshot = await getDocs(collection(db, COLLECTION_NAME));
    const matches = querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        // Ensure createdAt exists, fallback to completedAt if not present
        createdAt: data.createdAt || data.completedAt || new Date().toISOString(),
      } as MatchHistoryItem;
    });
    
    // Sort by createdAt descending in client-side
    matches.sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    });
    
    return matches;
  } catch (error) {
    console.error("Error getting all matches history:", error);
    throw error;
  }
};

// GET - Lấy matches theo date range (dùng createdAt)
// Note: Filtering by date in client-side to avoid composite index requirement
export const getMatchesByDateRange = async (
  startDate: string,
  endDate: string
): Promise<MatchHistoryItem[]> => {
  try {
    // Format dates to YYYY-MM-DD for comparison
    const startDateStr = startDate.split("T")[0];
    const endDateStr = endDate.split("T")[0];

    // Get all matches and filter in client-side to avoid composite index
    const allMatches = await getAllMatchesHistory();
    
    // Filter by date range using createdAt - compare date strings (YYYY-MM-DD) only
    return allMatches.filter((match) => {
      // Use createdAt for filtering
      const matchCreatedAt = match.createdAt;
      if (!matchCreatedAt) return false;
      
      // Extract date part (YYYY-MM-DD) from createdAt ISO string
      const matchDateStr = new Date(matchCreatedAt).toISOString().split("T")[0];
      return matchDateStr >= startDateStr && matchDateStr <= endDateStr;
    });
  } catch (error) {
    console.error("Error getting matches by date range:", error);
    throw error;
  }
};

// GET - Lấy matches theo ngày (dùng createdAt)
// Note: Filtering by date in client-side to avoid composite index requirement
export const getMatchesByCreatedDate = async (
  date: string
): Promise<MatchHistoryItem[]> => {
  try {
    // Parse target date (YYYY-MM-DD format)
    const targetDateStr = date.split("T")[0]; // Ensure YYYY-MM-DD format
    
    // Get all matches and filter in client-side to avoid composite index
    const allMatches = await getAllMatchesHistory();
    
    console.log(`🔍 Filtering matches for date: ${targetDateStr}`);
    console.log(`📊 Total matches loaded: ${allMatches.length}`);
    
    // Filter by date using createdAt - compare date strings (YYYY-MM-DD) only
    const filteredMatches = allMatches.filter((match) => {
      // Use createdAt for filtering
      const matchCreatedAt = match.createdAt;
      if (!matchCreatedAt) {
        console.warn(`⚠️ Match ${match.id} has no createdAt`);
        return false;
      }
      
      // Extract date part (YYYY-MM-DD) from createdAt ISO string
      const matchDateStr = new Date(matchCreatedAt).toISOString().split("T")[0];
      const matches = matchDateStr === targetDateStr;
      
      if (matches) {
        console.log(`✅ Match ${match.id} matches date: ${matchDateStr}`);
      }
      
      return matches;
    });
    
    console.log(`✅ Found ${filteredMatches.length} matches for ${targetDateStr}`);
    
    return filteredMatches;
  } catch (error) {
    console.error("Error getting matches by created date:", error);
    throw error;
  }
};

// GET - Tìm ngày gần nhất có matches
export const getLatestMatchDate = async (): Promise<string | null> => {
  try {
    const allMatches = await getAllMatchesHistory();
    
    if (allMatches.length === 0) {
      return null;
    }

    // Matches are already sorted by createdAt desc
    const latestMatch = allMatches[0];
    if (latestMatch.createdAt) {
      const date = new Date(latestMatch.createdAt);
      return date.toISOString().split("T")[0];
    }
    
    return null;
  } catch (error) {
    console.error("Error getting latest match date:", error);
    throw error;
  }
};

