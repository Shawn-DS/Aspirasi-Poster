export const NO_STORE_HEADERS = {
  "Cache-Control": "no-store",
  "X-Content-Type-Options": "nosniff",
} as const;

export function jsonReply(status: number, body: object) {
  return Response.json(body, { status, headers: NO_STORE_HEADERS });
}

export function isSameOriginRequest(request: Request) {
  return (
    request.headers.get("origin") === new URL(request.url).origin &&
    request.headers.get("sec-fetch-site") !== "cross-site"
  );
}

export function isJsonContentType(request: Request) {
  return request.headers.get("content-type")?.split(";")[0].trim().toLowerCase() === "application/json";
}

export type BoundedJsonResult =
  | { ok: true; value: unknown }
  | { ok: false; reason: "empty" | "too_large" | "invalid" };

export async function readBoundedJson(request: Request, maxBytes: number): Promise<BoundedJsonResult> {
  if (Number(request.headers.get("content-length")) > maxBytes) {
    return { ok: false, reason: "too_large" };
  }
  const reader = request.body?.getReader();
  if (!reader) return { ok: false, reason: "empty" };
  try {
    const chunks: Uint8Array[] = [];
    let length = 0;
    while (true) {
      const chunk = await reader.read();
      if (chunk.done) break;
      length += chunk.value.byteLength;
      if (length > maxBytes) {
        await reader.cancel();
        return { ok: false, reason: "too_large" };
      }
      chunks.push(chunk.value);
    }
    const bytes = new Uint8Array(length);
    let offset = 0;
    for (const chunk of chunks) {
      bytes.set(chunk, offset);
      offset += chunk.byteLength;
    }
    return {
      ok: true,
      value: JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(bytes)),
    };
  } catch {
    return { ok: false, reason: "invalid" };
  }
}
