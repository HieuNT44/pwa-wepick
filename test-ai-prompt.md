# Test Prompt cho AI Tính Toán Cafe

## Prompt mẫu để test:

```
Bạn là một hệ thống tính toán cafe cho các trận đấu bóng bàn.

Dữ liệu các trận đấu hôm nay:
[
  {
    "id": "match_1",
    "matchType": "Đơn",
    "team1": ["Hieu"],
    "team2": ["Thang"],
    "score": "11-8",
    "startTime": "14:30",
    "date": "2024-01-15",
    "completedAt": "2024-01-15T14:30:00.000Z",
    "player_win": ["Hieu"],
    "player_lose": ["Thang"]
  },
  {
    "id": "match_2",
    "matchType": "Đơn",
    "team1": ["Hieu"],
    "team2": ["Thang"],
    "score": "9-11",
    "startTime": "15:00",
    "date": "2024-01-15",
    "completedAt": "2024-01-15T15:00:00.000Z",
    "player_win": ["Thang"],
    "player_lose": ["Hieu"]
  },
  {
    "id": "match_3",
    "matchType": "Đơn",
    "team1": ["Hieu"],
    "team2": ["Anh"],
    "score": "11-9",
    "startTime": "15:30",
    "date": "2024-01-15",
    "completedAt": "2024-01-15T15:30:00.000Z",
    "player_win": ["Hieu"],
    "player_lose": ["Anh"]
  },
  {
    "id": "match_4",
    "matchType": "Đôi",
    "team1": ["Hieu", "Thang"],
    "team2": ["Anh", "Tuan"],
    "score": "11-10",
    "startTime": "16:00",
    "date": "2024-01-15",
    "completedAt": "2024-01-15T16:00:00.000Z",
    "player_win": ["Hieu", "Thang"],
    "player_lose": ["Anh", "Tuan"]
  }
]

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
- date phải là ngày của các trận đấu (lấy từ match.date, tất cả match phải cùng ngày)
```

## Kết quả mong đợi:

Dựa trên dữ liệu test trên, kết quả nên là:

```json
{
  "date": "2024-01-15",
  "totalSingleMatches": 3,
  "totalDoubleMatches": 1,
  "cafeResults": [
    {
      "playerLose": "Anh",
      "playerWin": "Hieu",
      "amount": 1
    },
    {
      "playerLose": "Anh",
      "playerWin": "Hieu",
      "amount": 1
    },
    {
      "playerLose": "Hieu",
      "playerWin": "Thang",
      "amount": 1
    },
    {
      "playerLose": "Tuan",
      "playerWin": "Thang",
      "amount": 1
    }
  ]
}
```

**Giải thích:**

- Match 1: Thang thua Hieu → Thang trả Hieu 1 cốc
- Match 2: Hieu thua Thang → Hieu trả Thang 1 cốc
- Match 3: Anh thua Hieu → Anh trả Hieu 1 cốc
- Match 4 (Đôi): Anh trả Hieu 1 cốc, Tuan trả Thang 1 cốc

**Sau khi tính net balance:**

- Hieu vs Thang: Hieu nhận 1 từ Thang, Hieu trả 1 cho Thang → **Cân bằng (không hiển thị)**
- Anh vs Hieu: Anh trả Hieu 2 cốc (1 từ match 3 + 1 từ match 4) → **Anh trả Hieu 2 cốc**
- Tuan vs Thang: Tuan trả Thang 1 cốc → **Tuan trả Thang 1 cốc**

**Kết quả cuối cùng sau khi gộp:**

```json
{
  "date": "2024-01-15",
  "totalSingleMatches": 3,
  "totalDoubleMatches": 1,
  "cafeResults": [
    {
      "playerLose": "Anh",
      "playerWin": "Hieu",
      "amount": 2
    },
    {
      "playerLose": "Tuan",
      "playerWin": "Thang",
      "amount": 1
    }
  ]
}
```

## Cách test:

1. Copy toàn bộ prompt trên
2. Paste vào bất kỳ AI nào (ChatGPT, Claude, Mistral AI, etc.)
3. Kiểm tra kết quả JSON trả về có đúng format và logic không
