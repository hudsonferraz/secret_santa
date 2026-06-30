import { NextRequest, NextResponse } from "next/server";
import * as events from "@/server/services/events";
import * as people from "@/server/services/people";
import { isAuthorized } from "@/lib/auth";
import { z } from "zod";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Acesso negado" }, { status: 401 });
  }

  const { id } = await params;
  const eventItem = await events.getOne(Number(id));
  if (eventItem) return NextResponse.json({ event: eventItem });

  return NextResponse.json({ error: "Ocorreu um erro" }, { status: 404 });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Acesso negado" }, { status: 401 });
  }

  const { id } = await params;
  const updateEventSchema = z.object({
    status: z.boolean().optional(),
    title: z.string().optional(),
    description: z.string().optional(),
    grouped: z.boolean().optional(),
  });
  const body = updateEventSchema.safeParse(
    await request.json().catch(() => null),
  );
  if (!body.success) {
    return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
  }

  const updatedEvent = await events.update(Number(id), body.data);
  if (updatedEvent) {
    if (updatedEvent.status) {
      const result = await events.doMatches(Number(id));
      if (!result) {
        return NextResponse.json(
          { error: "Grupo impossível de ser formado" },
          { status: 400 },
        );
      }
    } else {
      await people.updatePerson({ id_event: Number(id) }, { matched: "" });
    }
    return NextResponse.json({ event: updatedEvent });
  }

  return NextResponse.json({ error: "Ocorreu um erro" }, { status: 400 });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Acesso negado" }, { status: 401 });
  }

  const { id } = await params;
  const deletedEvent = await events.remove(Number(id));
  if (deletedEvent) return NextResponse.json({ event: deletedEvent });

  return NextResponse.json({ error: "Ocorreu um erro" }, { status: 400 });
}
