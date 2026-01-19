export interface Player {
  id: string; // Firestore document ID
  name: string; // Định danh duy nhất (từ user.name)
  email?: string;
  nickname?: string;
  role?: "admin" | "user";
  avatar?: string;
  totalWins?: number;
  totalLosses?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePlayerInput {
  name: string;
  email?: string;
  nickname?: string;
  role?: "admin" | "user";
  avatar?: string;
  totalWins?: number;
  totalLosses?: number;
}

export interface UpdatePlayerInput {
  id: string;
  name?: string;
  email?: string;
  nickname?: string;
  role?: "admin" | "user";
  avatar?: string;
  totalWins?: number;
  totalLosses?: number;
}

