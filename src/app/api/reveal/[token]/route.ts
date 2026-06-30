import { NextResponse } from "next/server";
import * as people from "@/server/services/people";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;
  const result = await people.getRevealByToken(token);

  if (result.kind === "not_found") {
    return NextResponse.json({ error: "Link inválido" }, { status: 404 });
  }

  return NextResponse.json({ reveal: result });
}
