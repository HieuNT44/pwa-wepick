export interface Match {
  id?: string; // Firestore document ID
  date: string; // ISO date string
  time: string; // Format: "HH:mm"
  court: string; // Sân số: "Sân số 1", "Sân số 2", etc.
  status: "completed" | "live" | "upcoming"; // Trạng thái trận đấu
  team1: {
    player1Id: string;
    player2Id?: string;
    score: number;
    name?: string; // Display name: "Hoàng & Thắng"
  };
  team2: {
    player1Id: string;
    player2Id?: string;
    score: number;
    name?: string; // Display name: "Anh & Cường"
  };
  createdAt?: string;
  updatedAt?: string;
}

export type CreateMatchInput = Omit<Match, "id" | "createdAt" | "updatedAt">;

export type UpdateMatchInput = Partial<Omit<Match, "id">> & { id: string };

