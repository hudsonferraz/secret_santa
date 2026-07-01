import { NextResponse } from "next/server";
import { z } from "zod";
import { createOrganizer } from "@/server/services/organizers";
import {
  clearAuthAttempts,
  getClientIp,
  isAuthRateLimited,
  recordFailedAuthAttempt,
} from "@/server/services/loginRateLimit";
import { createSessionToken } from "@/server/services/session";
import { setAdminSessionCookie } from "@/lib/sessionCookie";

export async function POST(request: Request) {
  const clientIp = getClientIp(request);
  const rateLimit = isAuthRateLimited("register", clientIp);

  if (rateLimit.limited) {
    return NextResponse.json(
      {
        error: `Muitas tentativas de cadastro. Tente novamente em ${rateLimit.retryAfterSeconds} segundos.`,
      },
      { status: 429 },
    );
  }

  const registerSchema = z.object({
    name: z.string(),
    email: z.string(),
    password: z.string(),
  });
  const body = registerSchema.safeParse(await request.json().catch(() => null));
  if (!body.success) {
    return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
  }

  if (!process.env.SESSION_SECRET) {
    return NextResponse.json(
      { error: "Autenticação não configurada no servidor." },
      { status: 503 },
    );
  }

  const createResult = await createOrganizer(body.data);
  if (!createResult.ok) {
    recordFailedAuthAttempt("register", clientIp);
    return NextResponse.json({ error: createResult.error }, { status: 400 });
  }

  clearAuthAttempts("register", clientIp);

  const sessionToken = await createSessionToken({
    organizerId: createResult.organizer.id,
    email: createResult.organizer.email,
    name: createResult.organizer.name,
  });
  const response = NextResponse.json({ ok: true }, { status: 201 });
  setAdminSessionCookie(response, sessionToken);

  return response;
}
