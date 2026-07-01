import type { EventPeople, EventPeopleSummary } from "@/lib/types";

export function formatGroupShareSummary(
  groupId: number,
  groupPeople: EventPeople[] | undefined,
  peopleSummary: EventPeopleSummary | null,
): string {
  if (groupPeople !== undefined) {
    const participantCount = groupPeople.length;
    const sentCount = groupPeople.filter((person) => person.link_sent).length;

    return `${participantCount} participante${participantCount === 1 ? "" : "s"} · ${sentCount} enviado${sentCount === 1 ? "" : "s"}`;
  }

  const groupSummary = peopleSummary?.byGroup[groupId];
  if (groupSummary) {
    return `${groupSummary.participantCount} participante${groupSummary.participantCount === 1 ? "" : "s"} · ${groupSummary.sentCount} enviado${groupSummary.sentCount === 1 ? "" : "s"}`;
  }

  return "Toque para carregar participantes";
}
