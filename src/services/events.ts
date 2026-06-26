import { PrismaClient, Prisma } from "@prisma/client";

const prisma = new PrismaClient();

export const getAll = async () => {
  try {
    return await prisma.event.findMany();
  } catch (error) {
    return false;
  }
};

export const getOne = async (id: number) => {
  try {
    return await prisma.event.findFirst({ where: { id } });
  } catch (error) {
    return false;
  }
};

type EventsCreateData = Prisma.Args<typeof prisma.event, "create">["data"];
export const add = async (data: EventsCreateData) => {
  try {
    return await prisma.event.create({ data });
  } catch (error) {
    return false;
  }
};

type EventsUpdateData = Prisma.Args<typeof prisma.event, "update">["data"];
export const update = async (id: number, data: EventsUpdateData) => {
  try {
    return await prisma.event.update({ where: { id }, data });
  } catch (error) {
    return false;
  }
};

export const remove = async (id: number) => {
  try {
    return await prisma.event.delete({ where: { id } });
  } catch (error) {
    return false;
  }
};
