export interface User {
  id?: string; // Firestore document ID
  name: string;
  email: string;
  nickname: string;
  role: "admin" | "player" | "coach" | string; // Có thể mở rộng thêm roles
  matchHistory: string[]; // Format: ['thua - Hiếu', 'thắng - Hiếu', ...]
  totalWins: number;
  totalLosses: number;
  createdAt?: string; // ISO date string
  updatedAt?: string; // ISO date string
}

// Helper type để tạo user mới (không có id)
export type CreateUserInput = Omit<User, "id" | "createdAt" | "updatedAt">;

// Helper type để update user (tất cả fields optional trừ id)
export type UpdateUserInput = Partial<Omit<User, "id">> & { id: string };

