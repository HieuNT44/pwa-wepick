// Script to clear today's match history from localStorage
// Run this in browser console or via Node.js

if (typeof window !== "undefined") {
  // Browser environment
  localStorage.removeItem("wepick_today_match_history");
  console.log("✅ Đã xóa lịch sử trận đấu hôm nay");
} else {
  // Node.js environment - can't access localStorage
  console.log("⚠️ Script này chỉ chạy được trong browser console");
  console.log("Mở browser console và chạy: localStorage.removeItem('wepick_today_match_history')");
}

