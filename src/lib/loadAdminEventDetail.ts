import {
  adminCreateGroup,
  adminGetEvent,
  adminGetGroups,
  adminGetPeople,
} from "@/lib/apiClient";
import type { Event, EventGroup, EventPeople } from "@/lib/types";

const DEFAULT_GROUP_NAME = "Participantes";

export type AdminEventDetailLoadResult =
  | {
      status: "ready";
      event: Event;
      groups: EventGroup[];
      people: EventPeople[];
      selectedGroupId: number | null;
    }
  | {
      status: "not_found";
      error?: string;
    };

export async function loadAdminEventDetail(
  eventId: number,
): Promise<AdminEventDetailLoadResult> {
  const eventResult = await adminGetEvent(eventId);
  if (!eventResult.ok) {
    return {
      status: "not_found",
      error: eventResult.error,
    };
  }

  const currentEvent = eventResult.data.event;
  const groupsResult = await adminGetGroups(eventId);
  if (!groupsResult.ok) {
    return {
      status: "not_found",
      error: groupsResult.error,
    };
  }

  let currentGroups = groupsResult.data.groups;

  if (!currentEvent.grouped && currentGroups.length === 0) {
    const createGroupResult = await adminCreateGroup(
      eventId,
      DEFAULT_GROUP_NAME,
    );
    if (createGroupResult.ok) {
      currentGroups = [createGroupResult.data.group];
    }
  }

  const selectedGroupId = currentGroups[0]?.id ?? null;
  let people: EventPeople[] = [];

  if (selectedGroupId !== null) {
    const peopleResult = await adminGetPeople(eventId, selectedGroupId);
    if (peopleResult.ok) {
      people = peopleResult.data.people;
    }
  }

  return {
    status: "ready",
    event: currentEvent,
    groups: currentGroups,
    people,
    selectedGroupId,
  };
}
