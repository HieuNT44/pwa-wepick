// Firebase exports
export { app, analytics } from "./config";
export { db } from "./firestore";

// Re-export commonly used Firebase functions
export { getAnalytics, logEvent, type Analytics } from "firebase/analytics";

// Players exports
export {
  getAllPlayers,
  getPlayerById,
  getPlayerByName,
  getPlayersByNames,
  createPlayer,
  updatePlayer,
  deletePlayer,
} from "./players";
export { initializeApp, type FirebaseApp } from "firebase/app";

// Re-export user functions
export * from "./users";
export type { User, CreateUserInput, UpdateUserInput } from "@/types/user";

// Re-export match functions
export * from "./matches";
export type { Match, CreateMatchInput, UpdateMatchInput } from "@/types/match";

