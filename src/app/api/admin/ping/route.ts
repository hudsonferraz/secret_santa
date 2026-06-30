import { NextRequest, NextResponse } from "next/server";
import { isAuthorized } from "@/lib/auth";

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Acesso negado" }, { status: 401 });
  }

  return NextResponse.json({ pong: true, admin: true });
}
