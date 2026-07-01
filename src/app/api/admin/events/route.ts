import { NextRequest, NextResponse } from "next/server";
import * as events from "@/server/services/events";
import { getOrganizerIdOrDeny } from "@/lib/auth";
import { createEventSchema } from "@/server/validation/adminInput";

export async function GET(request: NextRequest) {
  const organizerId = await getOrganizerIdOrDeny(request);
  if (organizerId instanceof NextResponse) return organizerId;

  const items = await events.getAll(organizerId);
  if (items) return NextResponse.json({ events: items });

  return NextResponse.json({ error: "Ocorreu um erro" }, { status: 400 });
}

export async function POST(request: NextRequest) {
  const organizerId = await getOrganizerIdOrDeny(request);
  if (organizerId instanceof NextResponse) return organizerId;

  const body = createEventSchema.safeParse(await request.json().catch(() => null));
  if (!body.success) {
    return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
  }

  const newEvent = await events.add({
    ...body.data,
    id_organizer: organizerId,
  });
  if (newEvent) return NextResponse.json({ event: newEvent }, { status: 201 });

  return NextResponse.json({ error: "Ocorreu um erro" }, { status: 400 });
}
