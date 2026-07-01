import { NextRequest, NextResponse } from "next/server";
import { getOrganizerSession } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const session = await getOrganizerSession(request);
  if (!session) {
    return NextResponse.json({ error: "Acesso negado" }, { status: 401 });
  }

  return NextResponse.json({
    pong: true,
    organizer: {
      id: session.organizerId,
      email: session.email,
      name: session.name,
    },
  });
}
