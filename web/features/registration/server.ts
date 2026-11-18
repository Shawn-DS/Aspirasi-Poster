import { isJsonContentType, isSameOriginRequest, jsonReply, readBoundedJson } from "../../lib/request";
import { normalizeStudentId } from "./validation";

export const MAX_REGISTRATION_BYTES = 1024;

// This endpoint intentionally accepts public enrolment, but never returns a list
// or reveals whether another participant's ID has already been registered.
export async function registerParticipant(request: Request, db?: D1Database): Promise<Response> {
  if (request.method !== "POST") return jsonReply(405, { error: "Kaedah tidak dibenarkan." });
  if (!isSameOriginRequest(request)) {
    return jsonReply(403, { error: "Sila sertai melalui halaman jemputan ini." });
  }
  if (!isJsonContentType(request)) {
    return jsonReply(415, { error: "Permintaan tidak sah." });
  }
  const parsed = await readBoundedJson(request, MAX_REGISTRATION_BYTES);
  if (!parsed.ok) {
    if (parsed.reason === "too_large") return jsonReply(413, { error: "Permintaan terlalu panjang." });
    if (parsed.reason === "empty") return jsonReply(400, { error: "Sila masukkan nombor matrik." });
    return jsonReply(400, { error: "Permintaan tidak sah. Sila cuba lagi." });
  }
  const { value } = parsed;
  if (!value || typeof value !== "object" || Array.isArray(value) || Object.keys(value).some(key => key !== "studentId")) {
    return jsonReply(400, { error: "Permintaan tidak sah." });
  }
  const studentId = normalizeStudentId((value as { studentId?: unknown }).studentId);
  if (!studentId) return jsonReply(400, { error: "Masukkan nombor matrik antara 1 hingga 80 aksara." });
  if (!db) return jsonReply(503, { error: "Pendaftaran belum tersedia. Sila cuba lagi sebentar." });
  try {
    await db.prepare("INSERT INTO participants (student_id) VALUES (?) ON CONFLICT(student_id) DO NOTHING").bind(studentId).run();
    return jsonReply(200, { ok: true });
  } catch {
    // Do not log student IDs or leak database details to public visitors.
    return jsonReply(503, { error: "Pendaftaran tidak dapat disimpan. Semak sambungan dan cuba lagi." });
  }
}
