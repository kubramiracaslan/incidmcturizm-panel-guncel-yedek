import { timingSafeEqual } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { retryPendingRequests } from "@/lib/integrations/omSync";

function isAuthorized(authHeader: string | null, secret: string): boolean {
  if (!authHeader?.startsWith("Bearer ")) return false;
  const token = Buffer.from(authHeader.slice(7));
  const expected = Buffer.from(secret);
  return token.length === expected.length && timingSafeEqual(token, expected);
}

export async function POST(request: NextRequest) {
  const secret = process.env.OM_SYNC_CRON_SECRET;
  if (!secret || !isAuthorized(request.headers.get("authorization"), secret)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await retryPendingRequests();
  return NextResponse.json(result);
}
