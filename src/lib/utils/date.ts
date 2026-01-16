/**
 * Tính tuần trong năm (ISO week)
 */
export function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

/**
 * Format date thành dd/mm/yyyy
 */
export function formatDate(date: Date): string {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

/**
 * Format date với tuần: dd/mm/yyyy (Tuần thứ xx)
 */
export function formatDateWithWeek(date: Date): string {
  const formattedDate = formatDate(date);
  const weekNumber = getWeekNumber(date);
  return `${formattedDate} (Tuần thứ ${weekNumber})`;
}

/**
 * Lấy ngày hôm nay
 */
export function getToday(): Date {
  return new Date();
}

/**
 * Format time thành HH:mm
 */
export function formatTime(date: Date): string {
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
}

