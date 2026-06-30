import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import * as groups from "./groups";
import { decryptMatch } from "../utils/match";

type GetAllFilters = { id_event: number; id_group?: number };
export const getAll = async (filters: GetAllFilters) => {
  try {
    return await prisma.eventPeople.findMany({ where: filters });
  } catch {
    return false;
  }
};

type GetOneFilters = {
  id?: number;
  id_event?: number;
  id_group?: number;
  reveal_token?: string;
};
export const getOne = async (filters: GetOneFilters) => {
  try {
    if (!filters.id && !filters.reveal_token) return false;
    return await prisma.eventPeople.findFirst({ where: filters });
  } catch {
    return false;
  }
};

export const getByRevealToken = async (revealToken: string) => {
  try {
    return await prisma.eventPeople.findFirst({
      where: { reveal_token: revealToken },
      include: {
        event: {
          select: {
            id: true,
            status: true,
            title: true,
            description: true,
          },
        },
      },
    });
  } catch {
    return false;
  }
};

export type RevealResult =
  | { kind: "not_found" }
  | { kind: "draw_pending"; eventTitle: string; eventDescription: string }
  | { kind: "no_match"; personName: string; eventTitle: string }
  | {
      kind: "revealed";
      personName: string;
      matchName: string;
      eventTitle: string;
      eventDescription: string;
    };

export const getRevealByToken = async (
  revealToken: string,
): Promise<RevealResult> => {
  const personItem = await getByRevealToken(revealToken);
  if (!personItem || !personItem.event) {
    return { kind: "not_found" };
  }

  if (!personItem.event.status) {
    return {
      kind: "draw_pending",
      eventTitle: personItem.event.title,
      eventDescription: personItem.event.description,
    };
  }

  if (!personItem.matched) {
    return {
      kind: "no_match",
      personName: personItem.name,
      eventTitle: personItem.event.title,
    };
  }

  const matchId = decryptMatch(personItem.matched);
  const matchedPerson = await getOne({
    id: matchId,
    id_event: personItem.id_event,
  });

  if (!matchedPerson) {
    return {
      kind: "no_match",
      personName: personItem.name,
      eventTitle: personItem.event.title,
    };
  }

  return {
    kind: "revealed",
    personName: personItem.name,
    matchName: matchedPerson.name,
    eventTitle: personItem.event.title,
    eventDescription: personItem.event.description,
  };
};

type PeopleCreateData = Prisma.Args<
  typeof prisma.eventPeople,
  "create"
>["data"];
export const addPerson = async (data: PeopleCreateData) => {
  try {
    if (!data.id_group) return false;

    const group = await groups.getOne({
      id: data.id_group,
      id_event: data.id_event,
    });
    if (!group) return false;

    return await prisma.eventPeople.create({ data });
  } catch {
    return false;
  }
};

type PeopleUpdateData = Prisma.Args<
  typeof prisma.eventPeople,
  "update"
>["data"];
type UpdateFilters = { id?: number; id_event?: number; id_group?: number };
export const updatePerson = async (
  filters: UpdateFilters,
  data: PeopleUpdateData,
) => {
  try {
    return await prisma.eventPeople.updateMany({ where: filters, data });
  } catch {
    return false;
  }
};

type DeleteFilters = { id: number; id_event?: number; id_group?: number };
export const deletePerson = async (filters: DeleteFilters) => {
  try {
    return await prisma.eventPeople.delete({ where: filters });
  } catch {
    return false;
  }
};
