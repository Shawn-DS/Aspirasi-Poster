import { env } from "cloudflare:workers";
import { registerParticipant } from "@/features/registration/server";

export const dynamic = "force-dynamic";
export async function POST(request: Request) {
  return registerParticipant(request, env.DB);
}
