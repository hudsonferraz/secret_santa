import { NextRequest, NextResponse } from "next/server";
import * as people from "@/server/services/people";
import { getOrganizerIdOrDeny } from "@/lib/auth";
import {
  getEventEditBlockResponse,
  getEventOwnershipBlockResponse,
} from "@/server/guards/eventEditable";
import { updatePersonSchema } from "@/server/validation/adminInput";

export async function GET(
  request: NextRequest,
  {
    params,
  }: { params: Promise<{ idEvent: string; idGroup: string; id: string }> },
) {
  const organizerId = await getOrganizerIdOrDeny(request);
  if (organizerId instanceof NextResponse) return organizerId;

  const { idEvent, idGroup, id } = await params;
  const eventId = Number(idEvent);

  const ownershipResponse = await getEventOwnershipBlockResponse(
    eventId,
    organizerId,
  );
  if (ownershipResponse) return ownershipResponse;

  const personItem = await people.getOne({
    id: Number(id),
    id_event: eventId,
    id_group: Number(idGroup),
  });
  if (personItem) return NextResponse.json({ person: personItem });

  return NextResponse.json({ error: "Ocorreu um erro" }, { status: 404 });
}

export async function PUT(
  request: NextRequest,
  {
    params,
  }: { params: Promise<{ idEvent: string; idGroup: string; id: string }> },
) {
  const organizerId = await getOrganizerIdOrDeny(request);
  if (organizerId instanceof NextResponse) return organizerId;

  const { idEvent, idGroup, id } = await params;
  const eventId = Number(idEvent);

  const lockedResponse = await getEventEditBlockResponse(eventId, organizerId);
  if (lockedResponse) return lockedResponse;

  const body = updatePersonSchema.safeParse(
    await request.json().catch(() => null),
  );
  if (!body.success) {
    return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
  }

  const updatedPerson = await people.updatePerson(
    { id: Number(id), id_event: eventId, id_group: Number(idGroup) },
    body.data,
  );

  if (updatedPerson) {
    const personItem = await people.getOne({
      id: Number(id),
      id_event: eventId,
    });
    return NextResponse.json({ person: personItem });
  }

  return NextResponse.json({ error: "Ocorreu um erro" }, { status: 400 });
}

export async function DELETE(
  request: NextRequest,
  {
    params,
  }: { params: Promise<{ idEvent: string; idGroup: string; id: string }> },
) {
  const organizerId = await getOrganizerIdOrDeny(request);
  if (organizerId instanceof NextResponse) return organizerId;

  const { idEvent, idGroup, id } = await params;
  const eventId = Number(idEvent);

  const lockedResponse = await getEventEditBlockResponse(eventId, organizerId);
  if (lockedResponse) return lockedResponse;

  const deletedPerson = await people.deletePerson({
    id: Number(id),
    id_event: eventId,
    id_group: Number(idGroup),
  });
  if (deletedPerson) return NextResponse.json({ person: deletedPerson });

  return NextResponse.json({ error: "Ocorreu um erro" }, { status: 400 });
}
