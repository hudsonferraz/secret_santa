import { prisma } from "@/lib/prisma";
import { buildDrawPreview, type DrawPreview } from "./drawPreview";

export async function getEventDrawPreview(
  eventId: number,
  organizerId: number,
): Promise<DrawPreview | false> {
  try {
    const eventItem = await prisma.event.findFirst({
      where: { id: eventId, id_organizer: organizerId },
      select: { grouped: true },
    });

    if (!eventItem) {
      return false;
    }

    const [eventGroups, eventPeople] = await Promise.all([
      prisma.eventGroup.findMany({
        where: { id_event: eventId },
        select: { id: true, name: true },
        orderBy: { id: "asc" },
      }),
      prisma.eventPeople.findMany({
        where: { id_event: eventId },
        select: { id: true, id_group: true },
      }),
    ]);

    return buildDrawPreview(eventPeople, eventGroups, eventItem.grouped);
  } catch {
    return false;
  }
}
