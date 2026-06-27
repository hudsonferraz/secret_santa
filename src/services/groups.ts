import { PrismaClient, Prisma } from "@prisma/client";
import * as events from "./events";

const prisma = new PrismaClient();

export const getAll = async (id_event: number) => {
  try {
    return await prisma.eventGroup.findMany({ where: { id_event } });
  } catch (error) {
    return false;
  }
};

type GetOneFilters = { id: number; id_event: number };
export const getOne = async (filters: GetOneFilters) => {
  try {
    return await prisma.eventGroup.findFirst({ where: filters });
  } catch (error) {
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
  } catch (error) {
    return false;
  }
};
