import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import * as people from "./people";
import { encryptMatch } from "../utils/match";

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

export const doMatches = async (id: number): Promise<boolean> => {
  const eventItem = await prisma.event.findFirst({
    where: { id },
    select: { grouped: true },
  });

  if (!eventItem) return false;

  const peopleList = await people.getAll({ id_event: id });
  if (!peopleList) return false;

  let sortedList: { id: number; match: number }[] = [];
  let sortable: number[] = [];

  let attempts = 0;
  const maxAttempts = peopleList.length;
  let keepTrying = true;
  while (keepTrying && attempts < maxAttempts) {
    keepTrying = false;
    attempts++;
    sortedList = [];
    sortable = peopleList.map((item) => item.id);

    for (const person of peopleList) {
      let sortableFiltered: number[] = sortable;
      if (eventItem.grouped) {
        sortableFiltered = sortable.filter((sortableItem) => {
          const sortablePerson = peopleList.find(
            (item) => item.id === sortableItem,
          );
          return person.id_group !== sortablePerson?.id_group;
        });
      }

      if (
        sortableFiltered.length === 0 ||
        (sortableFiltered.length === 1 && person.id === sortableFiltered[0])
      ) {
        keepTrying = true;
      } else {
        let sortedIndex = Math.floor(Math.random() * sortableFiltered.length);
        while (sortableFiltered[sortedIndex] === person.id) {
          sortedIndex = Math.floor(Math.random() * sortableFiltered.length);
        }

        const match = sortableFiltered[sortedIndex];
        if (match === undefined) {
          keepTrying = true;
        } else {
          sortedList.push({ id: person.id, match });
          sortable = sortable.filter((item) => item !== match);
        }
      }
    }
  }

  if (attempts < maxAttempts) {
    for (const sorted of sortedList) {
      await people.updatePerson(
        { id: sorted.id, id_event: id },
        { matched: encryptMatch(sorted.match) },
      );
    }
    return true;
  }

  return false;
};
