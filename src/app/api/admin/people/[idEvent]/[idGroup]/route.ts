import { NextRequest, NextResponse } from "next/server";
import * as people from "@/server/services/people";
import { getOrganizerIdOrDeny } from "@/lib/auth";
import {
  getEventEditBlockResponse,
  getEventOwnershipBlockResponse,
} from "@/server/guards/eventEditable";
import { createPersonSchema } from "@/server/validation/adminInput";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ idEvent: string; idGroup: string }> },
) {
  const organizerId = await getOrganizerIdOrDeny(request);
  if (organizerId instanceof NextResponse) return organizerId;

  const { idEvent, idGroup } = await params;
  const eventId = Number(idEvent);

  const ownershipResponse = await getEventOwnershipBlockResponse(
    eventId,
    organizerId,
  );
  if (ownershipResponse) return ownershipResponse;

  const items = await people.getAll({
    id_event: eventId,
    id_group: Number(idGroup),
  });
  if (items) return NextResponse.json({ people: items });

  return NextResponse.json({ error: "Ocorreu um erro" }, { status: 400 });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ idEvent: string; idGroup: string }> },
) {
  const organizerId = await getOrganizerIdOrDeny(request);
  if (organizerId instanceof NextResponse) return organizerId;

  const { idEvent, idGroup } = await params;
  const eventId = Number(idEvent);

  const lockedResponse = await getEventEditBlockResponse(eventId, organizerId);
  if (lockedResponse) return lockedResponse;

  const body = createPersonSchema.safeParse(
    await request.json().catch(() => null),
  );
  if (!body.success) {
    return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
  }

  const newPerson = await people.addPerson({
    id_event: eventId,
    id_group: Number(idGroup),
    name: body.data.name,
  });
  if (newPerson) {
    return NextResponse.json({ person: newPerson }, { status: 201 });
  }

  return NextResponse.json({ error: "Ocorreu um erro" }, { status: 400 });
}
