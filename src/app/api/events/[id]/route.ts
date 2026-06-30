import { NextResponse } from "next/server";
import * as events from "@/server/services/events";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const eventItem = await events.getOne(Number(id));
  if (eventItem) return NextResponse.json({ event: eventItem });

  return NextResponse.json({ error: "Ocorreu um erro" }, { status: 404 });
}
