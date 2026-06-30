import { NextRequest, NextResponse } from "next/server";
import * as groups from "@/server/services/groups";
import { isAuthorized } from "@/lib/auth";
import { z } from "zod";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ idEvent: string; id: string }> },
) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Acesso negado" }, { status: 401 });
  }

  const { idEvent, id } = await params;
  const groupItem = await groups.getOne({
    id: Number(id),
    id_event: Number(idEvent),
  });
  if (groupItem) return NextResponse.json({ group: groupItem });

  return NextResponse.json({ error: "Ocorreu um erro" }, { status: 404 });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ idEvent: string; id: string }> },
) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Acesso negado" }, { status: 401 });
  }

  const { idEvent, id } = await params;
  const updateGroupSchema = z.object({ name: z.string().optional() });
  const body = updateGroupSchema.safeParse(
    await request.json().catch(() => null),
  );
  if (!body.success) {
    return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
  }

  const updatedGroup = await groups.updateGroup(
    { id: Number(id), id_event: Number(idEvent) },
    body.data,
  );
  if (updatedGroup) return NextResponse.json({ group: updatedGroup });

  return NextResponse.json({ error: "Ocorreu um erro" }, { status: 400 });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ idEvent: string; id: string }> },
) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Acesso negado" }, { status: 401 });
  }

  const { idEvent, id } = await params;
  const deletedGroup = await groups.deleteGroup({
    id: Number(id),
    id_event: Number(idEvent),
  });
  if (deletedGroup) return NextResponse.json({ group: deletedGroup });

  return NextResponse.json({ error: "Ocorreu um erro" }, { status: 400 });
}
