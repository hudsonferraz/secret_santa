import { NextRequest, NextResponse } from "next/server";
import * as groups from "@/server/services/groups";
import { isAuthorized } from "@/lib/auth";
import { getEventEditBlockResponse } from "@/server/guards/eventEditable";
import { z } from "zod";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ idEvent: string }> },
) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Acesso negado" }, { status: 401 });
  }

  const { idEvent } = await params;
  const items = await groups.getAll(Number(idEvent));
  if (items) return NextResponse.json({ groups: items });

  return NextResponse.json({ error: "Ocorreu um erro" }, { status: 400 });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ idEvent: string }> },
) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Acesso negado" }, { status: 401 });
  }

  const { idEvent } = await params;
  const eventId = Number(idEvent);

  const lockedResponse = await getEventEditBlockResponse(eventId);
  if (lockedResponse) return lockedResponse;

  const addGroupSchema = z.object({ name: z.string() });
  const body = addGroupSchema.safeParse(await request.json().catch(() => null));
  if (!body.success) {
    return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
  }

  const newGroup = await groups.addGroup({
    id_event: Number(idEvent),
    name: body.data.name,
  });
  if (newGroup) return NextResponse.json({ group: newGroup }, { status: 201 });

  return NextResponse.json({ error: "Ocorreu um erro" }, { status: 400 });
}
