import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { encryptMatch } from "../utils/match";
import { findSecretSantaAssignment } from "./matching";

export const getAll = async () => {
  try {
    return await prisma.event.findMany();
  } catch {
    return false;
  }
};

export const getOne = async (id: number) => {
  try {
    return await prisma.event.findFirst({ where: { id } });
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
export const update = async (id: number, data: EventsUpdateData) => {
  try {
    return await prisma.event.update({ where: { id }, data });
  } catch {
    return false;
  }
};

export const remove = async (id: number) => {
  try {
    return await prisma.event.delete({ where: { id } });
  } catch {
    return false;
  }
};

export const runDraw = async (id: number): Promise<boolean> => {
  try {
    return await prisma.$transaction(async (transaction) => {
      const eventItem = await transaction.event.findFirst({
        where: { id },
        select: { grouped: true, status: true },
      });

      if (!eventItem || eventItem.status) return false;

      const peopleList = await transaction.eventPeople.findMany({
        where: { id_event: id },
        select: { id: true, id_group: true },
      });

      const assignments = findSecretSantaAssignment(
        peopleList,
        eventItem.grouped,
      );
      if (!assignments) return false;

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

      return true;
    });
  } catch {
    return false;
  }
};

export const resetDraw = async (id: number): Promise<boolean> => {
  try {
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
