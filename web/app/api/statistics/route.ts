import { env } from "cloudflare:workers";
import { readStatistics, recordStatistics } from "@/features/statistics/server";

export const dynamic = "force-dynamic";
export async function GET(request: Request) {
  return readStatistics(request, env.DB);
}
export async function POST(request: Request) {
  return recordStatistics(request, env.DB);
}
