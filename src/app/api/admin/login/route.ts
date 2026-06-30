import { NextResponse } from "next/server";
import * as auth from "@/server/services/auth";
import { z } from "zod";

export async function POST(request: Request) {
  const loginSchema = z.object({ password: z.string() });
  const body = loginSchema.safeParse(await request.json().catch(() => null));
  if (!body.success) {
    return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
  }

  if (auth.validatePassword(body.data.password)) {
    return NextResponse.json({ token: auth.createToken() });
  }

  return NextResponse.json({ error: "Senha inválida" }, { status: 401 });
}
