import { NextRequest, NextResponse } from "next/server";
import * as events from "@/server/services/events";
import { isAuthorized } from "@/lib/auth";
import { getEventEditBlockResponse } from "@/server/guards/eventEditable";
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
  const eventId = Number(id);

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

  const { status, ...rest } = body.data;

  if (status === true) {
    const drawResult = await events.runDraw(eventId);
    if (!drawResult) {
      return NextResponse.json(
        { error: "Grupo impossível de ser formado" },
        { status: 400 },
      );
    }

    if (Object.keys(rest).length > 0) {
      await events.update(eventId, rest);
    }

    const eventItem = await events.getOne(eventId);
    return NextResponse.json({ event: eventItem });
  }

  if (status === false) {
    const resetResult = await events.resetDraw(eventId);
    if (!resetResult) {
      return NextResponse.json({ error: "Ocorreu um erro" }, { status: 400 });
    }

    if (Object.keys(rest).length > 0) {
      await events.update(eventId, rest);
    }

    const eventItem = await events.getOne(eventId);
    return NextResponse.json({ event: eventItem });
  }

  const lockedResponse = await getEventEditBlockResponse(eventId);
  if (lockedResponse) return lockedResponse;

  const updatedEvent = await events.update(eventId, body.data);
  if (updatedEvent) return NextResponse.json({ event: updatedEvent });

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
