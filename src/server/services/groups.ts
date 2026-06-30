import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import * as events from "./events";

export const getAll = async (id_event: number) => {
  try {
    return await prisma.eventGroup.findMany({ where: { id_event } });
  } catch {
    return false;
  }
};

type GetOneFilters = { id: number; id_event: number };
export const getOne = async (filters: GetOneFilters) => {
  try {
    return await prisma.eventGroup.findFirst({ where: filters });
  } catch {
    return false;
  }
};

type GroupCreateData = Prisma.Args<typeof prisma.eventGroup, "create">["data"];
export const addGroup = async (data: GroupCreateData) => {
  try {
    if (!data.id_event) return false;

    const eventItem = await events.getOne(data.id_event);
    if (!eventItem) return false;

    return await prisma.eventGroup.create({ data });
  } catch {
    return false;
  }
};

type UpdateFilters = { id: number; id_event?: number };
type GroupUpdateData = Prisma.Args<typeof prisma.eventGroup, "update">["data"];
export const updateGroup = async (
  filters: UpdateFilters,
  data: GroupUpdateData,
) => {
  try {
    return await prisma.eventGroup.update({ where: filters, data });
  } catch {
    return false;
  }
};

type DeleteFilters = { id: number; id_event?: number };
export const deleteGroup = async (filters: DeleteFilters) => {
  try {
    return await prisma.eventGroup.delete({ where: filters });
  } catch {
    return false;
  }
};
