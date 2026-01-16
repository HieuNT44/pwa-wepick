import { addMatchToHistory, calculateStats } from "@/lib/utils/user-stats";
import type { CreateUserInput, UpdateUserInput, User } from "@/types/user";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  updateDoc,
  where,
  type DocumentData,
} from "firebase/firestore";
import { db } from "./firestore";

const COLLECTION_NAME = "users";

// GET - Lấy tất cả users
export const getAllUsers = async (): Promise<User[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, COLLECTION_NAME));
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as User[];
  } catch (error) {
    console.error("Error getting users:", error);
    throw error;
  }
};

// GET - Lấy user theo ID
export const getUserById = async (userId: string): Promise<User | null> => {
  try {
    const docRef = doc(db, COLLECTION_NAME, userId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data(),
      } as User;
    }
    return null;
  } catch (error) {
    console.error("Error getting user:", error);
    throw error;
  }
};

// GET - Lấy user theo email
export const getUserByEmail = async (email: string): Promise<User | null> => {
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      where("email", "==", email)
    );
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      return {
        id: doc.id,
        ...doc.data(),
      } as User;
    }
    return null;
  } catch (error) {
    console.error("Error getting user by email:", error);
    throw error;
  }
};

// POST - Tạo user mới
export const createUser = async (
  userData: CreateUserInput
): Promise<string> => {
  try {
    // Validate và tính toán stats nếu chưa có
    const stats = calculateStats(userData.matchHistory || []);

    const newUser: DocumentData = {
      ...userData,
      totalWins: userData.totalWins ?? stats.totalWins,
      totalLosses: userData.totalLosses ?? stats.totalLosses,
      matchHistory: userData.matchHistory || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const docRef = await addDoc(collection(db, COLLECTION_NAME), newUser);
    return docRef.id;
  } catch (error) {
    console.error("Error creating user:", error);
    throw error;
  }
};

// PUT - Cập nhật user
export const updateUser = async (userData: UpdateUserInput): Promise<void> => {
  try {
    const { id, ...updateData } = userData;
    const docRef = doc(db, COLLECTION_NAME, id);

    // Nếu matchHistory thay đổi, tự động tính lại stats
    if (updateData.matchHistory) {
      const stats = calculateStats(updateData.matchHistory);
      updateData.totalWins = stats.totalWins;
      updateData.totalLosses = stats.totalLosses;
    }

    await updateDoc(docRef, {
      ...updateData,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error updating user:", error);
    throw error;
  }
};

// DELETE - Xóa user
export const deleteUser = async (userId: string): Promise<void> => {
  try {
    const docRef = doc(db, COLLECTION_NAME, userId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error("Error deleting user:", error);
    throw error;
  }
};

// Thêm match vào history
export const addMatch = async (
  userId: string,
  result: "thắng" | "thua",
  opponent: string
): Promise<void> => {
  try {
    const user = await getUserById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    const { matchHistory, totalWins, totalLosses } = addMatchToHistory(
      user,
      result,
      opponent
    );

    await updateUser({
      id: userId,
      matchHistory,
      totalWins,
      totalLosses,
    });
  } catch (error) {
    console.error("Error adding match:", error);
    throw error;
  }
};

// Query users theo role
export const getUsersByRole = async (role: string): Promise<User[]> => {
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      where("role", "==", role),
      orderBy("totalWins", "desc")
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as User[];
  } catch (error) {
    console.error("Error getting users by role:", error);
    throw error;
  }
};

// Lấy top players (sắp xếp theo totalWins)
export const getTopPlayers = async (
  limitCount: number = 10
): Promise<User[]> => {
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      orderBy("totalWins", "desc"),
      orderBy("totalLosses", "asc")
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.slice(0, limitCount).map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as User[];
  } catch (error) {
    console.error("Error getting top players:", error);
    throw error;
  }
};
