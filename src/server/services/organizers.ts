import { prisma } from "@/lib/prisma";
import {
  hashPassword,
  isValidEmail,
  isValidPassword,
  normalizeEmail,
  verifyOrganizerPassword,
} from "./auth";

export type CreateOrganizerResult =
  | { ok: true; organizer: { id: number; email: string; name: string } }
  | { ok: false; error: string };

export type AuthenticateOrganizerResult =
  | { ok: true; organizer: { id: number; email: string; name: string } }
  | { ok: false; error: string };

export async function createOrganizer(data: {
  email: string;
  name: string;
  password: string;
}): Promise<CreateOrganizerResult> {
  const email = normalizeEmail(data.email);
  const name = data.name.trim();

  if (!name) {
    return { ok: false, error: "Informe seu nome." };
  }

  if (!isValidEmail(email)) {
    return { ok: false, error: "Informe um e-mail válido." };
  }

  if (!isValidPassword(data.password)) {
    return { ok: false, error: "A senha deve ter pelo menos 8 caracteres." };
  }

  const existingOrganizer = await prisma.organizer.findUnique({
    where: { email },
    select: { id: true },
  });

  if (existingOrganizer) {
    return { ok: false, error: "Este e-mail já está cadastrado." };
  }

  try {
    const passwordHash = await hashPassword(data.password);
    const organizer = await prisma.organizer.create({
      data: {
        email,
        name,
        password_hash: passwordHash,
      },
      select: { id: true, email: true, name: true },
    });

    return { ok: true, organizer };
  } catch {
    return { ok: false, error: "Não foi possível criar a conta." };
  }
}

export async function authenticateOrganizer(
  email: string,
  password: string,
): Promise<AuthenticateOrganizerResult> {
  const normalizedEmail = normalizeEmail(email);

  if (!isValidEmail(normalizedEmail)) {
    return { ok: false, error: "E-mail ou senha inválidos." };
  }

  const organizer = await prisma.organizer.findUnique({
    where: { email: normalizedEmail },
    select: { id: true, email: true, name: true, password_hash: true },
  });

  if (!organizer) {
    return { ok: false, error: "E-mail ou senha inválidos." };
  }

  const passwordMatches = await verifyOrganizerPassword(
    password,
    organizer.password_hash,
  );

  if (!passwordMatches) {
    return { ok: false, error: "E-mail ou senha inválidos." };
  }

  return {
    ok: true,
    organizer: {
      id: organizer.id,
      email: organizer.email,
      name: organizer.name,
    },
  };
}

export async function getOrganizerById(organizerId: number) {
  return prisma.organizer.findUnique({
    where: { id: organizerId },
    select: { id: true, email: true, name: true },
  });
}
