/**
 * Cafe calculation utilities for AI processing
 */

import type { MatchHistoryItem } from "./local-storage";

/**
 * Interface for AI response
 */
export interface CafeCalculationResult {
  date: string; // Format: "YYYY-MM-DD"
  totalSingleMatches: number;
  totalDoubleMatches: number;
  cafeResults: Array<{
    playerLose: string; // User name (from user.name field)
    playerWin: string; // User name (from user.name field)
    amount: number; // Number of coffee cups
  }>;
}

/**
 * Generate prompt for AI to calculate cafe results
 */
export function generateCafeCalculationPrompt(
  matches: MatchHistoryItem[]
): string {
  const matchesJson = JSON.stringify(matches, null, 2);

  return `Bạn là một hệ thống tính toán cafe cho các trận đấu bóng bàn.

Dữ liệu các trận đấu hôm nay:
${matchesJson}

QUY TẮC TÍNH TOÁN:
1. Trận đơn (matchType: "Đơn"):
   - Người thua (player_lose) phải trả 1 cốc cafe cho người thắng (player_win)
   - Mỗi trận đơn tạo ra 1 transaction: player_lose trả 1 cốc cho player_win

2. Trận đôi (matchType: "Đôi"):
   - Mỗi người trong đội thua (player_lose) phải trả 1 cốc cafe cho 1 người trong đội thắng (player_win) theo thứ tự
   - Ví dụ: Đội thua có 2 người [A, B], đội thắng có 2 người [C, D]
     → A (vị trí 0) trả 1 cốc cho C (vị trí 0)
     → B (vị trí 1) trả 1 cốc cho D (vị trí 1)
   - Tổng cộng: 2 người thua × 1 cốc = 2 cốc cafe

3. Tính số dư cuối cùng (Net Balance):
   - Tính tổng số cốc cafe mà mỗi người phải trả cho từng người khác
   - Tính tổng số cốc cafe mà mỗi người được nhận từ từng người khác
   - Trừ đi cho nhau để ra số dư cuối cùng giữa mỗi cặp người chơi
   - Chỉ hiển thị những cặp có số dư khác 0
   - Ví dụ:
     * A thắng B 2 trận → B phải trả A 2 cốc
     * B thắng A 1 trận → A phải trả B 1 cốc
     * Kết quả cuối: B phải trả A 1 cốc cafe (2 - 1 = 1)
   - Nếu số dư = 0, không cần hiển thị cặp đó trong "cafeResults"

YÊU CẦU:
Hãy tính toán và trả về kết quả theo đúng format JSON sau (KHÔNG được thêm bất kỳ text nào khác, chỉ trả về JSON thuần):

{
  "date": "YYYY-MM-DD",
  "totalSingleMatches": <số>,
  "totalDoubleMatches": <số>,
  "cafeResults": [
    {
      "playerLose": "<tên người thua>",
      "playerWin": "<tên người thắng>",
      "amount": <số cốc cafe>
    }
  ]
}

LƯU Ý:
- Chỉ tính các trận đấu trong mảng matches được cung cấp
- Đảm bảo tất cả các transaction đều được tính đúng
- QUAN TRỌNG: Phải tính số dư cuối cùng (net balance) giữa các cặp người chơi
  * Nếu A phải trả B 2 cốc và B phải trả A 1 cốc → Kết quả: A phải trả B 1 cốc (2 - 1 = 1)
  * Nếu số dư = 0, không hiển thị cặp đó trong "cafeResults"
- Sắp xếp "cafeResults" theo thứ tự alphabet của playerLose, sau đó playerWin
- Nếu không có trận đấu nào, trả về mảng "cafeResults" rỗng và tổng số trận = 0
- date phải là ngày của các trận đấu (lấy từ match.date, tất cả match phải cùng ngày)`;
}

/**
 * Format matches data for AI processing
 * This function prepares the data from localStorage to send to AI
 */
export function formatMatchesForAI(
  matches: MatchHistoryItem[]
): MatchHistoryItem[] {
  // Return matches as-is, already in correct format
  return matches;
}

/**
 * Validate AI response format
 */
export function validateAIResponse(
  response: unknown
): response is CafeCalculationResult {
  if (!response || typeof response !== "object") {
    return false;
  }

  const result = response as Record<string, unknown>;

  // Check required fields
  if (
    typeof result.date !== "string" ||
    typeof result.totalSingleMatches !== "number" ||
    typeof result.totalDoubleMatches !== "number" ||
    !Array.isArray(result.cafeResults)
  ) {
    return false;
  }

  // Validate each cafe transaction
  for (const transaction of result.cafeResults) {
    if (
      typeof transaction !== "object" ||
      typeof transaction.playerLose !== "string" ||
      typeof transaction.playerWin !== "string" ||
      typeof transaction.amount !== "number"
    ) {
      return false;
    }
  }

  return true;
}
