import { toast } from "sonner";
import type { loadAdminEventDetail } from "@/lib/loadAdminEventDetail";
import type { Event, EventGroup, EventPeople } from "@/lib/types";
import type { AdminEventDetailPageState } from "./constants";

export function applyEventDetailLoadResult(
  result: Awaited<ReturnType<typeof loadAdminEventDetail>>,
  setters: {
    setEventItem: (event: Event | null) => void;
    setGroups: (groups: EventGroup[]) => void;
    setPeople: (people: EventPeople[]) => void;
    setSelectedGroupId: (groupId: number | null) => void;
    setPageState: (state: AdminEventDetailPageState) => void;
    seedPeopleByGroupId?: (groupId: number, people: EventPeople[]) => void;
  },
) {
  if (result.status === "not_found") {
    if (result.error) {
      toast.error(result.error);
    }
    setters.setPageState("not_found");
    return;
  }

  setters.setEventItem(result.event);
  setters.setGroups(result.groups);
  setters.setPeople(result.people);
  setters.setSelectedGroupId(result.selectedGroupId);
  if (result.selectedGroupId !== null) {
    setters.seedPeopleByGroupId?.(result.selectedGroupId, result.people);
  }
  setters.setPageState("ready");
}
