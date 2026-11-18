// Export the participant list from the remote Cloudflare D1 database to CSV.
// Usage (from web/): npm run export
// Requires `wrangler login` with the account that owns the database.
import { spawnSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import config from "../cloudflare.json" with { type: "json" };

const wrangler = fileURLToPath(new URL("../node_modules/wrangler/bin/wrangler.js", import.meta.url));
const result = spawnSync(process.execPath, [
  wrangler, "d1", "execute", config.d1DatabaseName, "--remote", "--json",
  "--command", "SELECT student_id, joined_at FROM participants ORDER BY joined_at",
], { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });

if (result.status !== 0) {
  console.error(result.stderr || result.stdout);
  process.exit(result.status ?? 1);
}

const rows = JSON.parse(result.stdout)[0]?.results ?? [];
const cell = value => `"${String(value ?? "").replaceAll('"', '""')}"`;
// Shift UTC to Malaysia time (UTC+8) for readability; keep the original too.
const local = iso => new Date(new Date(iso).getTime() + 8 * 3600_000).toISOString().replace("T", " ").slice(0, 19);
const lines = ["student_id,joined_at_myt,joined_at_utc", ...rows.map(r => [r.student_id, local(r.joined_at), r.joined_at].map(cell).join(","))];

const outDir = fileURLToPath(new URL("../../output/participants/", import.meta.url));
mkdirSync(outDir, { recursive: true });
const stamp = new Date(Date.now() + 8 * 3600_000).toISOString().slice(0, 16).replace(/[-:T]/g, "");
const file = `${outDir}participants-${stamp}.csv`;
// BOM so Excel opens UTF-8 correctly.
writeFileSync(file, "\uFEFF" + lines.join("\r\n") + "\r\n", "utf8");
console.log(`Exported ${rows.length} participant(s) to ${file}`);
