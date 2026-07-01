import { NextRequest, NextResponse } from "next/server";
import { getOrganizerIdOrDeny } from "@/lib/auth";
import { getEventPeopleSummary } from "@/server/services/people";
import { getEventOwnershipBlockResponse } from "@/server/guards/eventEditable";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const organizerId = await getOrganizerIdOrDeny(request);
  if (organizerId instanceof NextResponse) return organizerId;

  const { id } = await params;
  const eventId = Number(id);

  const ownershipResponse = await getEventOwnershipBlockResponse(
    eventId,
    organizerId,
  );
  if (ownershipResponse) return ownershipResponse;

  const summary = await getEventPeopleSummary(eventId);

  if (summary) {
    return NextResponse.json({ summary });
  }

  return NextResponse.json({ error: "Ocorreu um erro" }, { status: 400 });
}
