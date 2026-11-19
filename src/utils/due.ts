export type DueStatus = "overdue" | "soon" | "later";

// "ใกล้ครบกำหนด" = เหลือไม่ถึง 2 วัน (48 ชม.) ก่อนหมดวันที่กำหนด
export const DUE_SOON_MS = 2 * 24 * 60 * 60 * 1000;

// ถือว่า due date เป็น "ทั้งวัน" ตามเวลาท้องถิ่น: ครบกำหนดตอนเที่ยงคืนของวันถัดไป
export function dueDeadline(iso: string): Date {
  const [y, m, d] = iso.slice(0, 10).split("-").map(Number);
  return new Date(y, m - 1, d + 1);
}

export function getDueStatus(iso: string, now: Date = new Date()): DueStatus {
  const remaining = dueDeadline(iso).getTime() - now.getTime();
  if (remaining <= 0) return "overdue";
  if (remaining <= DUE_SOON_MS) return "soon";
  return "later";
}

export function formatDueLabel(iso: string): string {
  const [y, m, d] = iso.slice(0, 10).split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}