import { NextRequest, NextResponse } from "next/server";
import { getOrganizerIdOrDeny } from "@/lib/auth";
import { getEventDrawPreview } from "@/server/services/drawPreviewLoader";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const organizerId = await getOrganizerIdOrDeny(request);
  if (organizerId instanceof NextResponse) return organizerId;

  const { id } = await params;
  const preview = await getEventDrawPreview(Number(id), organizerId);

  if (preview) {
    return NextResponse.json({ preview });
  }

  return NextResponse.json({ error: "Evento não encontrado" }, { status: 404 });
}
