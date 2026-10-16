import { normalizeStudentId } from "./validation";

export const MAX_REGISTRATION_BYTES = 1024;
const responseHeaders = { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" };
function reply(status: number, body: object) {
  return Response.json(body, { status, headers: responseHeaders });
}

// This endpoint intentionally accepts public enrolment, but never returns a list
// or reveals whether another participant's ID has already been registered.
export async function registerParticipant(request: Request, db?: D1Database): Promise<Response> {
  if (request.method !== "POST") return reply(405, { error: "Kaedah tidak dibenarkan." });
  if (request.headers.get("origin") !== new URL(request.url).origin || request.headers.get("sec-fetch-site") === "cross-site") {
    return reply(403, { error: "Sila sertai melalui halaman jemputan ini." });
  }
  if (request.headers.get("content-type")?.split(";")[0].trim().toLowerCase() !== "application/json") {
    return reply(415, { error: "Permintaan tidak sah." });
  }
  if (Number(request.headers.get("content-length")) > MAX_REGISTRATION_BYTES) return reply(413, { error: "Permintaan terlalu panjang." });
  let value: unknown;
  try {
    // Bound the streamed body too; Content-Length is not trusted.
    const reader = request.body?.getReader();
    if (!reader) return reply(400, { error: "Sila masukkan nombor matrik." });
    const chunks: Uint8Array[] = [];
    let length = 0;
    while (true) {
      const chunk = await reader.read();
      if (chunk.done) break;
      length += chunk.value.byteLength;
      if (length > MAX_REGISTRATION_BYTES) {
        await reader.cancel();
        return reply(413, { error: "Permintaan terlalu panjang." });
      }
      chunks.push(chunk.value);
    }
    const bytes = new Uint8Array(length);
    let offset = 0;
    for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
    value = JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(bytes));
  } catch {
    return reply(400, { error: "Permintaan tidak sah. Sila cuba lagi." });
  }
  if (!value || typeof value !== "object" || Array.isArray(value) || Object.keys(value).some(key => key !== "studentId")) {
    return reply(400, { error: "Permintaan tidak sah." });
  }
  const studentId = normalizeStudentId((value as { studentId?: unknown }).studentId);
  if (!studentId) return reply(400, { error: "Masukkan nombor matrik antara 1 hingga 80 aksara." });
  if (!db) return reply(503, { error: "Pendaftaran belum tersedia. Sila cuba lagi sebentar." });
  try {
    await db.prepare("INSERT INTO participants (student_id) VALUES (?) ON CONFLICT(student_id) DO NOTHING").bind(studentId).run();
    return reply(200, { ok: true });
  } catch {
    // Do not log student IDs or leak database details to public visitors.
    return reply(503, { error: "Pendaftaran tidak dapat disimpan. Semak sambungan dan cuba lagi." });
  }
}
