import { NextRequest, NextResponse } from "next/server";
import * as groups from "@/server/services/groups";
import { getOrganizerIdOrDeny } from "@/lib/auth";
import {
  getEventEditBlockResponse,
  getEventOwnershipBlockResponse,
} from "@/server/guards/eventEditable";
import { createGroupSchema } from "@/server/validation/adminInput";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ idEvent: string }> },
) {
  const organizerId = await getOrganizerIdOrDeny(request);
  if (organizerId instanceof NextResponse) return organizerId;

  const { idEvent } = await params;
  const eventId = Number(idEvent);

  const ownershipResponse = await getEventOwnershipBlockResponse(
    eventId,
    organizerId,
  );
  if (ownershipResponse) return ownershipResponse;

  const items = await groups.getAll(eventId);
  if (items) return NextResponse.json({ groups: items });

  return NextResponse.json({ error: "Ocorreu um erro" }, { status: 400 });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ idEvent: string }> },
) {
  const organizerId = await getOrganizerIdOrDeny(request);
  if (organizerId instanceof NextResponse) return organizerId;

  const { idEvent } = await params;
  const eventId = Number(idEvent);

  const lockedResponse = await getEventEditBlockResponse(eventId, organizerId);
  if (lockedResponse) return lockedResponse;

  const body = createGroupSchema.safeParse(await request.json().catch(() => null));
  if (!body.success) {
    return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
  }

  const newGroup = await groups.addGroup({
    id_event: eventId,
    name: body.data.name,
  });
  if (newGroup) return NextResponse.json({ group: newGroup }, { status: 201 });

  return NextResponse.json({ error: "Ocorreu um erro" }, { status: 400 });
}
