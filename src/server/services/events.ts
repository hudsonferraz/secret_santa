import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { encryptMatch } from "../utils/match";
import { findSecretSantaAssignment, getDrawValidationError } from "./matching";

export type RunDrawResult = { ok: true } | { ok: false; error: string };

export const getAll = async (organizerId: number) => {
  try {
    return await prisma.event.findMany({
      where: { id_organizer: organizerId },
      orderBy: { id: "desc" },
    });
  } catch {
    return false;
  }
};

export const getOnePublic = async (id: number) => {
  try {
    return await prisma.event.findFirst({ where: { id } });
  } catch {
    return false;
  }
};

export const getOne = async (id: number, organizerId: number) => {
  try {
    return await prisma.event.findFirst({
      where: { id, id_organizer: organizerId },
    });
  } catch {
    return false;
  }
};

type EventsCreateData = Prisma.Args<typeof prisma.event, "create">["data"];
export const add = async (data: EventsCreateData) => {
  try {
    return await prisma.event.create({ data });
  } catch {
    return false;
  }
};

type EventsUpdateData = Prisma.Args<typeof prisma.event, "update">["data"];
export const update = async (id: number, organizerId: number, data: EventsUpdateData) => {
  try {
    const updatedCount = await prisma.event.updateMany({
      where: { id, id_organizer: organizerId },
      data,
    });

    if (updatedCount.count === 0) {
      return false;
    }

    return await prisma.event.findFirst({
      where: { id, id_organizer: organizerId },
    });
  } catch {
    return false;
  }
};

export const remove = async (id: number, organizerId: number) => {
  try {
    const eventItem = await prisma.event.findFirst({
      where: { id, id_organizer: organizerId },
      select: { id: true },
    });

    if (!eventItem) {
      return false;
    }

    return await prisma.$transaction(async (transaction) => {
      await transaction.eventPeople.deleteMany({ where: { id_event: id } });
      await transaction.eventGroup.deleteMany({ where: { id_event: id } });
      return await transaction.event.delete({ where: { id } });
    });
  } catch {
    return false;
  }
};

export const runDraw = async (
  id: number,
  organizerId: number,
): Promise<RunDrawResult> => {
  try {
    const eventItem = await prisma.event.findFirst({
      where: { id, id_organizer: organizerId },
      select: { grouped: true, status: true },
    });

    if (!eventItem) {
      return { ok: false, error: "Evento não encontrado." };
    }

    if (eventItem.status) {
      return { ok: false, error: "Sorteio já realizado." };
    }

    const peopleList = await prisma.eventPeople.findMany({
      where: { id_event: id },
      select: { id: true, id_group: true },
    });

    const validationError = getDrawValidationError(
      peopleList,
      eventItem.grouped,
    );
    if (validationError) {
      return { ok: false, error: validationError };
    }

    const assignments = findSecretSantaAssignment(
      peopleList,
      eventItem.grouped,
    );
    if (!assignments) {
      return {
        ok: false,
        error:
          "Não foi possível formar pares válidos com a composição atual de grupos.",
      };
    }

    await prisma.$transaction(async (transaction) => {
      for (const assignment of assignments) {
        await transaction.eventPeople.updateMany({
          where: { id: assignment.id, id_event: id },
          data: { matched: encryptMatch(assignment.match) },
        });
      }

      await transaction.event.update({
        where: { id },
        data: { status: true },
      });
    });

    return { ok: true };
  } catch {
    return { ok: false, error: "Ocorreu um erro ao realizar o sorteio." };
  }
};

export const resetDraw = async (id: number, organizerId: number): Promise<boolean> => {
  try {
    const eventItem = await prisma.event.findFirst({
      where: { id, id_organizer: organizerId },
      select: { id: true },
    });

    if (!eventItem) {
      return false;
    }

    await prisma.$transaction(async (transaction) => {
      await transaction.eventPeople.updateMany({
        where: { id_event: id },
        data: { matched: "" },
      });

      await transaction.event.update({
        where: { id },
        data: { status: false },
      });
    });
    return true;
  } catch {
    return false;
  }
};

export const isOwnedByOrganizer = async (
  eventId: number,
  organizerId: number,
): Promise<boolean> => {
  const eventItem = await prisma.event.findFirst({
    where: { id: eventId, id_organizer: organizerId },
    select: { id: true },
  });

  return eventItem !== null;
};
