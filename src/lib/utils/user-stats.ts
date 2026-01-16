import type { User } from "@/types/user";

/**
 * Tính toán lại totalWins và totalLosses từ matchHistory
 */
export function calculateStats(matchHistory: string[]): {
  totalWins: number;
  totalLosses: number;
} {
  let wins = 0;
  let losses = 0;

  matchHistory.forEach((match) => {
    if (match.startsWith("thắng")) {
      wins++;
    } else if (match.startsWith("thua")) {
      losses++;
    }
  });

  return { totalWins: wins, totalLosses: losses };
}

/**
 * Thêm match vào history và tự động cập nhật stats
 */
export function addMatchToHistory(
  user: User,
  result: "thắng" | "thua",
  opponent: string
): {
  matchHistory: string[];
  totalWins: number;
  totalLosses: number;
} {
  const newMatch = `${result} - ${opponent}`;
  const updatedHistory = [...user.matchHistory, newMatch];
  const stats = calculateStats(updatedHistory);

  return {
    matchHistory: updatedHistory,
    totalWins: stats.totalWins,
    totalLosses: stats.totalLosses,
  };
}

/**
 * Validate user data
 */
export function validateUser(user: Partial<User>): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!user.name || user.name.trim() === "") {
    errors.push("Tên không được để trống");
  }

  if (!user.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(user.email)) {
    errors.push("Email không hợp lệ");
  }

  if (!user.nickname || user.nickname.trim() === "") {
    errors.push("Nickname không được để trống");
  }

  if (!user.role) {
    errors.push("Role không được để trống");
  }

  if (!Array.isArray(user.matchHistory)) {
    errors.push("matchHistory phải là một array");
  }

  if (typeof user.totalWins !== "number" || user.totalWins < 0) {
    errors.push("totalWins phải là số >= 0");
  }

  if (typeof user.totalLosses !== "number" || user.totalLosses < 0) {
    errors.push("totalLosses phải là số >= 0");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

