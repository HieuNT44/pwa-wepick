import type {
  CreatePlayerInput,
  Player,
  UpdatePlayerInput,
} from "@/types/player";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  updateDoc,
  where,
  type DocumentData,
} from "firebase/firestore";
import { db } from "./firebase";

const COLLECTION_NAME = "players";

// GET - Lấy tất cả players
export const getAllPlayers = async (): Promise<Player[]> => {
  try {
    console.log("📡 Calling Firestore API: getAllPlayers()");
    console.log("   Collection:", COLLECTION_NAME);

    const snap = await getDocs(collection(db, COLLECTION_NAME));
    console.log("✅ Response received: Found", snap.docs.length, "documents");

    if (snap.docs.length > 0) {
      console.log("   First document:", snap.docs[0].id, snap.docs[0].data());
    }

    const players = snap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Player[];

    console.log("✅ Parsed players:", players.length, "players");
    return players;
  } catch (error) {
    console.error("❌ Error getting players from Firestore:", error);
    if (error instanceof Error) {
      console.error("   Error message:", error.message);
      console.error("   Error code:", (error as { code?: string }).code);
      console.error("   Error stack:", error.stack);
    }
    throw error;
  }
};

// GET - Lấy player theo ID
export const getPlayerById = async (
  playerId: string
): Promise<Player | null> => {
  try {
    const docRef = doc(db, COLLECTION_NAME, playerId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data(),
      } as Player;
    }
    return null;
  } catch (error) {
    console.error("Error getting player:", error);
    throw error;
  }
};

// GET - Lấy player theo name (định danh)
export const getPlayerByName = async (name: string): Promise<Player | null> => {
  try {
    const q = query(collection(db, COLLECTION_NAME), where("name", "==", name));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      return {
        id: doc.id,
        ...doc.data(),
      } as Player;
    }
    return null;
  } catch (error) {
    console.error("Error getting player by name:", error);
    throw error;
  }
};

// GET - Lấy players theo danh sách names
export const getPlayersByNames = async (names: string[]): Promise<Player[]> => {
  try {
    if (names.length === 0) return [];

    // Firestore "in" query supports up to 10 items
    if (names.length <= 10) {
      const q = query(
        collection(db, COLLECTION_NAME),
        where("name", "in", names)
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Player[];
    }

    // If more than 10, split into chunks
    const chunks: string[][] = [];
    for (let i = 0; i < names.length; i += 10) {
      chunks.push(names.slice(i, i + 10));
    }

    const results: Player[] = [];
    for (const chunk of chunks) {
      const q = query(
        collection(db, COLLECTION_NAME),
        where("name", "in", chunk)
      );
      const querySnapshot = await getDocs(q);
      results.push(
        ...(querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Player[])
      );
    }

    return results;
  } catch (error) {
    console.error("Error getting players by names:", error);
    throw error;
  }
};

// POST - Tạo player mới
export const createPlayer = async (
  playerData: CreatePlayerInput
): Promise<string> => {
  try {
    const newPlayer: DocumentData = {
      ...playerData,
      totalWins: playerData.totalWins ?? 0,
      totalLosses: playerData.totalLosses ?? 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const docRef = await addDoc(collection(db, COLLECTION_NAME), newPlayer);
    return docRef.id;
  } catch (error) {
    console.error("Error creating player:", error);
    throw error;
  }
};

// PUT - Cập nhật player
export const updatePlayer = async (
  playerData: UpdatePlayerInput
): Promise<void> => {
  try {
    const { id, ...updateData } = playerData;
    const docRef = doc(db, COLLECTION_NAME, id);

    await updateDoc(docRef, {
      ...updateData,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error updating player:", error);
    throw error;
  }
};

// DELETE - Xóa player
export const deletePlayer = async (playerId: string): Promise<void> => {
  try {
    const docRef = doc(db, COLLECTION_NAME, playerId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error("Error deleting player:", error);
    throw error;
  }
};

// Update player stats (wins/losses)
export const updatePlayerStats = async (
  playerName: string,
  incrementWins: number = 0,
  incrementLosses: number = 0
): Promise<void> => {
  try {
    console.log(`📊 Updating stats for player: ${playerName}`);
    console.log(`   Increment wins: ${incrementWins}, losses: ${incrementLosses}`);

    // Find player by name
    const player = await getPlayerByName(playerName);
    if (!player) {
      console.warn(`⚠️ Player not found: ${playerName}`);
      return;
    }

    const currentWins = player.totalWins || 0;
    const currentLosses = player.totalLosses || 0;
    const newWins = Math.max(0, currentWins + incrementWins);
    const newLosses = Math.max(0, currentLosses + incrementLosses);

    console.log(`   Current: ${currentWins} wins, ${currentLosses} losses`);
    console.log(`   New: ${newWins} wins, ${newLosses} losses`);

    await updatePlayer({
      id: player.id,
      totalWins: newWins,
      totalLosses: newLosses,
    });

    console.log(`✅ Stats updated for ${playerName}`);
  } catch (error) {
    console.error(`❌ Error updating player stats for ${playerName}:`, error);
    if (error instanceof Error) {
      console.error(`   Error message: ${error.message}`);
      console.error(`   Error code: ${(error as { code?: string }).code}`);
    }
    throw error;
  }
};

// Batch update multiple players' stats
export const updateMultiplePlayerStats = async (
  updates: Array<{
    playerName: string;
    incrementWins?: number;
    incrementLosses?: number;
  }>
): Promise<void> => {
  try {
    await Promise.all(
      updates.map((update) =>
        updatePlayerStats(
          update.playerName,
          update.incrementWins || 0,
          update.incrementLosses || 0
        )
      )
    );
  } catch (error) {
    console.error("Error updating multiple player stats:", error);
    throw error;
  }
};
