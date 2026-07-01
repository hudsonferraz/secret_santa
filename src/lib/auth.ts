import { NextRequest, NextResponse } from "next/server";
import {
  ADMIN_SESSION_COOKIE,
  verifySessionToken,
  type SessionPayload,
} from "@/server/services/session";

export async function getOrganizerSession(
  request: NextRequest,
): Promise<SessionPayload | null> {
  const sessionToken = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  if (!sessionToken) {
    return null;
  }

  return verifySessionToken(sessionToken);
}

export async function isAuthorized(request: NextRequest): Promise<boolean> {
  const session = await getOrganizerSession(request);
  return session !== null;
}

export async function getOrganizerIdOrDeny(
  request: NextRequest,
): Promise<number | NextResponse> {
  const session = await getOrganizerSession(request);
  if (!session) {
    return NextResponse.json({ error: "Acesso negado" }, { status: 401 });
  }

  return session.organizerId;
}
