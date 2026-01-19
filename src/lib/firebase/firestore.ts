import { getFirestore } from "firebase/firestore";
import { app } from "./config";

export const db = getFirestore(app);

// Log Firestore initialization
if (typeof window !== "undefined") {
  console.log("🔥 Firestore initialized:", db.app.name);
}

