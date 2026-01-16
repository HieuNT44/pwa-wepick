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
  type DocumentData,
} from "firebase/firestore";
import { db } from "./firestore";
import type { Match, CreateMatchInput, UpdateMatchInput } from "@/types/match";

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
    const q = query(
      collection(db, COLLECTION_NAME),
      where("date", ">=", `${dateStr}T00:00:00`),
      where("date", "<=", `${dateStr}T23:59:59`),
      orderBy("date"),
      orderBy("time")
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Match[];
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

