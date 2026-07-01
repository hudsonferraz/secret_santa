import { NextRequest, NextResponse } from "next/server";
import * as events from "@/server/services/events";
import { getOrganizerIdOrDeny } from "@/lib/auth";
import { getEventEditBlockResponse } from "@/server/guards/eventEditable";
import { z } from "zod";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const organizerId = await getOrganizerIdOrDeny(request);
  if (organizerId instanceof NextResponse) return organizerId;

  const { id } = await params;
  const eventItem = await events.getOne(Number(id), organizerId);
  if (eventItem) return NextResponse.json({ event: eventItem });

  return NextResponse.json({ error: "Evento não encontrado" }, { status: 404 });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const organizerId = await getOrganizerIdOrDeny(request);
  if (organizerId instanceof NextResponse) return organizerId;

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
    const drawResult = await events.runDraw(eventId, organizerId);
    if (!drawResult.ok) {
      return NextResponse.json({ error: drawResult.error }, { status: 400 });
    }

    if (Object.keys(rest).length > 0) {
      await events.update(eventId, organizerId, rest);
    }

    const eventItem = await events.getOne(eventId, organizerId);
    return NextResponse.json({ event: eventItem });
  }

  if (status === false) {
    const resetResult = await events.resetDraw(eventId, organizerId);
    if (!resetResult) {
      return NextResponse.json({ error: "Ocorreu um erro" }, { status: 400 });
    }

    if (Object.keys(rest).length > 0) {
      await events.update(eventId, organizerId, rest);
    }

    const eventItem = await events.getOne(eventId, organizerId);
    return NextResponse.json({ event: eventItem });
  }

  const lockedResponse = await getEventEditBlockResponse(eventId, organizerId);
  if (lockedResponse) return lockedResponse;

  const updatedEvent = await events.update(eventId, organizerId, body.data);
  if (updatedEvent) return NextResponse.json({ event: updatedEvent });

  return NextResponse.json({ error: "Ocorreu um erro" }, { status: 400 });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const organizerId = await getOrganizerIdOrDeny(request);
  if (organizerId instanceof NextResponse) return organizerId;

  const { id } = await params;
  const deletedEvent = await events.remove(Number(id), organizerId);
  if (deletedEvent) return NextResponse.json({ event: deletedEvent });

  return NextResponse.json({ error: "Ocorreu um erro" }, { status: 400 });
}
