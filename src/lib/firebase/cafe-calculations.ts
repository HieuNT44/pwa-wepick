/**
 * Firebase functions for cafe calculation results
 */

import type { CafeCalculationResult } from "@/lib/utils/cafe-calculation";
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  setDoc,
} from "firebase/firestore";
import { db } from "./firebase";

const COLLECTION_NAME = "cafe_calculations";

export interface CafeCalculationDocument {
  id?: string;
  date: string; // Format: "YYYY-MM-DD"
  calculatedAt: string; // ISO string
  result: CafeCalculationResult;
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
}

/**
 * Save cafe calculation result to Firebase
 */
export const saveCafeCalculationToFirebase = async (
  result: CafeCalculationResult
): Promise<string> => {
  try {
    const now = new Date().toISOString();
    
    // Check if calculation for this date already exists
    const existingDoc = await getCafeCalculationByDate(result.date);
    
    const docData: Omit<CafeCalculationDocument, "id"> = {
      date: result.date,
      calculatedAt: now,
      result,
      createdAt: existingDoc?.createdAt || now,
      updatedAt: now,
    };

    let docId: string;
    
    if (existingDoc?.id) {
      // Update existing document
      docId = existingDoc.id;
      await setDoc(doc(db, COLLECTION_NAME, docId), docData, { merge: true });
    } else {
      // Create new document
      const docRef = doc(collection(db, COLLECTION_NAME));
      docId = docRef.id;
      await setDoc(docRef, {
        ...docData,
        id: docId,
      });
    }

    console.log("✅ Cafe calculation saved to Firebase with ID:", docId);
    return docId;
  } catch (error) {
    console.error("❌ Error saving cafe calculation to Firebase:", error);
    throw error;
  }
};

/**
 * Get cafe calculation by date
 * Filter client-side to avoid composite index requirement
 */
export const getCafeCalculationByDate = async (
  date: string
): Promise<CafeCalculationDocument | null> => {
  try {
    // Get all documents and filter client-side to avoid composite index
    const querySnapshot = await getDocs(collection(db, COLLECTION_NAME));
    
    // Filter by date and sort by calculatedAt descending
    const matchingDocs = querySnapshot.docs
      .map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }) as CafeCalculationDocument)
      .filter((data) => data.date === date);
    
    if (matchingDocs.length === 0) {
      return null;
    }

    // Sort by calculatedAt descending and return the most recent one
    matchingDocs.sort((a, b) => {
      const dateA = a.calculatedAt ? new Date(a.calculatedAt).getTime() : 0;
      const dateB = b.calculatedAt ? new Date(b.calculatedAt).getTime() : 0;
      return dateB - dateA;
    });

    return matchingDocs[0];
  } catch (error) {
    console.error("Error getting cafe calculation by date:", error);
    throw error;
  }
};

/**
 * Get all cafe calculations
 * Sort client-side to avoid index requirement
 */
export const getAllCafeCalculations = async (): Promise<CafeCalculationDocument[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, COLLECTION_NAME));
    
    const allCalculations = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as CafeCalculationDocument[];
    
    // Sort by calculatedAt descending in client-side
    allCalculations.sort((a, b) => {
      const dateA = a.calculatedAt ? new Date(a.calculatedAt).getTime() : 0;
      const dateB = b.calculatedAt ? new Date(b.calculatedAt).getTime() : 0;
      return dateB - dateA;
    });
    
    return allCalculations;
  } catch (error) {
    console.error("Error getting all cafe calculations:", error);
    throw error;
  }
};

/**
 * Delete cafe calculation by date
 */
export const deleteCafeCalculationByDate = async (date: string): Promise<void> => {
  try {
    const existingDoc = await getCafeCalculationByDate(date);
    
    if (existingDoc?.id) {
      await deleteDoc(doc(db, COLLECTION_NAME, existingDoc.id));
      console.log("✅ Cafe calculation deleted for date:", date);
    }
  } catch (error) {
    console.error("Error deleting cafe calculation:", error);
    throw error;
  }
};

