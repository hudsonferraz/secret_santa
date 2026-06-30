import { NextRequest, NextResponse } from "next/server";
import * as people from "@/server/services/people";
import { decryptMatch } from "@/server/utils/match";
import { z } from "zod";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ idEvent: string }> },
) {
  const { idEvent } = await params;

  const searchSchema = z.object({ phone_number: z.string() });
  const query = searchSchema.safeParse({
    phone_number: request.nextUrl.searchParams.get("phone_number"),
  });
  if (!query.success) {
    return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
  }

  const personItem = await people.getOne({
    id_event: Number(idEvent),
    phone_number: query.data.phone_number,
  });

  if (personItem && personItem.matched) {
    const matchId = decryptMatch(personItem.matched);

    const personMatched = await people.getOne({
      id_event: Number(idEvent),
      id: matchId,
    });

    if (personMatched) {
      return NextResponse.json({
        person: { id: personItem.id, name: personItem.name },
        personMatched: { id: personMatched.id, name: personMatched.name },
      });
    }
  }

  return NextResponse.json({ person: personItem });
}
