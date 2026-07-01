import { NextResponse } from "next/server";
import * as events from "@/server/services/events";

const LOCKED_EVENT_MESSAGE =
  "Sorteio já realizado. Resetar antes de editar.";

export async function getEventEditBlockResponse(
  eventId: number,
  organizerId: number,
): Promise<NextResponse | null> {
  if (Number.isNaN(eventId)) {
    return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
  }

  const eventItem = await events.getOne(eventId, organizerId);
  if (!eventItem) {
    return NextResponse.json({ error: "Evento não encontrado" }, { status: 404 });
  }

  if (eventItem.status) {
    return NextResponse.json({ error: LOCKED_EVENT_MESSAGE }, { status: 409 });
  }

  return null;
}

export async function getEventOwnershipBlockResponse(
  eventId: number,
  organizerId: number,
): Promise<NextResponse | null> {
  if (Number.isNaN(eventId)) {
    return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
  }

  const isOwned = await events.isOwnedByOrganizer(eventId, organizerId);
  if (!isOwned) {
    return NextResponse.json({ error: "Evento não encontrado" }, { status: 404 });
  }

  return null;
}
