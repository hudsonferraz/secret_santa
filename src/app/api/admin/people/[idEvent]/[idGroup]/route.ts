import { NextRequest, NextResponse } from "next/server";
import * as people from "@/server/services/people";
import { isAuthorized } from "@/lib/auth";
import { getEventEditBlockResponse } from "@/server/guards/eventEditable";
import { z } from "zod";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ idEvent: string; idGroup: string }> },
) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Acesso negado" }, { status: 401 });
  }

  const { idEvent, idGroup } = await params;
  const items = await people.getAll({
    id_event: Number(idEvent),
    id_group: Number(idGroup),
  });
  if (items) return NextResponse.json({ people: items });

  return NextResponse.json({ error: "Ocorreu um erro" }, { status: 400 });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ idEvent: string; idGroup: string }> },
) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Acesso negado" }, { status: 401 });
  }

  const { idEvent, idGroup } = await params;
  const eventId = Number(idEvent);

  const lockedResponse = await getEventEditBlockResponse(eventId);
  if (lockedResponse) return lockedResponse;

  const addPersonSchema = z.object({
    name: z.string(),
  });
  const body = addPersonSchema.safeParse(
    await request.json().catch(() => null),
  );
  if (!body.success) {
    return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
  }

  const newPerson = await people.addPerson({
    id_event: Number(idEvent),
    id_group: Number(idGroup),
    name: body.data.name,
  });
  if (newPerson) {
    return NextResponse.json({ person: newPerson }, { status: 201 });
  }

  return NextResponse.json({ error: "Ocorreu um erro" }, { status: 400 });
}
