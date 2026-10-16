export const MAX_STUDENT_ID_LENGTH = 80;

export function normalizeStudentId(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed || Array.from(trimmed).length > MAX_STUDENT_ID_LENGTH || /[\p{Cc}\p{Cf}]/u.test(trimmed)) return null;
  const normalized = trimmed.toUpperCase();
  return Array.from(normalized).length <= MAX_STUDENT_ID_LENGTH ? normalized : null;
}
