import { NextRequest, NextResponse } from "next/server";
import * as groups from "@/server/services/groups";
import { getOrganizerIdOrDeny } from "@/lib/auth";
import {
  getEventEditBlockResponse,
  getEventOwnershipBlockResponse,
} from "@/server/guards/eventEditable";
import { z } from "zod";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ idEvent: string; id: string }> },
) {
  const organizerId = await getOrganizerIdOrDeny(request);
  if (organizerId instanceof NextResponse) return organizerId;

  const { idEvent, id } = await params;
  const eventId = Number(idEvent);

  const ownershipResponse = await getEventOwnershipBlockResponse(
    eventId,
    organizerId,
  );
  if (ownershipResponse) return ownershipResponse;

  const groupItem = await groups.getOne({
    id: Number(id),
    id_event: eventId,
  });
  if (groupItem) return NextResponse.json({ group: groupItem });

  return NextResponse.json({ error: "Ocorreu um erro" }, { status: 404 });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ idEvent: string; id: string }> },
) {
  const organizerId = await getOrganizerIdOrDeny(request);
  if (organizerId instanceof NextResponse) return organizerId;

  const { idEvent, id } = await params;
  const eventId = Number(idEvent);

  const lockedResponse = await getEventEditBlockResponse(eventId, organizerId);
  if (lockedResponse) return lockedResponse;

  const updateGroupSchema = z.object({ name: z.string().optional() });
  const body = updateGroupSchema.safeParse(
    await request.json().catch(() => null),
  );
  if (!body.success) {
    return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
  }

  const updatedGroup = await groups.updateGroup(
    { id: Number(id), id_event: eventId },
    body.data,
  );
  if (updatedGroup) return NextResponse.json({ group: updatedGroup });

  return NextResponse.json({ error: "Ocorreu um erro" }, { status: 400 });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ idEvent: string; id: string }> },
) {
  const organizerId = await getOrganizerIdOrDeny(request);
  if (organizerId instanceof NextResponse) return organizerId;

  const { idEvent, id } = await params;
  const eventId = Number(idEvent);

  const lockedResponse = await getEventEditBlockResponse(eventId, organizerId);
  if (lockedResponse) return lockedResponse;

  const deletedGroup = await groups.deleteGroup({
    id: Number(id),
    id_event: eventId,
  });
  if (deletedGroup) return NextResponse.json({ group: deletedGroup });

  return NextResponse.json({ error: "Ocorreu um erro" }, { status: 400 });
}
