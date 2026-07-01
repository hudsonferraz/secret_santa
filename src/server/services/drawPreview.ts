import {
  findSecretSantaAssignment,
  getDrawValidationError,
  type MatchPerson,
} from "./matching";

export type GroupDrawSummary = {
  id: number;
  name: string;
  participantCount: number;
};

export type DrawPreviewWarning = {
  id: string;
  message: string;
};

export type DrawPreview = {
  participantCount: number;
  groupCount: number;
  groupsWithParticipants: number;
  grouped: boolean;
  canDraw: boolean;
  groupedDrawPossible: boolean;
  blockingError: string | null;
  warnings: DrawPreviewWarning[];
  groups: GroupDrawSummary[];
};

export function buildDrawPreview(
  people: MatchPerson[],
  eventGroups: { id: number; name: string }[],
  grouped: boolean,
): DrawPreview {
  const warnings: DrawPreviewWarning[] = [];
  const participantCount = people.length;

  const participantCountByGroupId = new Map<number, number>();
  for (const person of people) {
    participantCountByGroupId.set(
      person.id_group,
      (participantCountByGroupId.get(person.id_group) ?? 0) + 1,
    );
  }

  const groupSummaries: GroupDrawSummary[] = eventGroups.map((group) => ({
    id: group.id,
    name: group.name,
    participantCount: participantCountByGroupId.get(group.id) ?? 0,
  }));

  for (const group of groupSummaries) {
    if (group.participantCount === 0) {
      warnings.push({
        id: `empty-group-${group.id}`,
        message: `O grupo "${group.name}" não tem participantes.`,
      });
      continue;
    }

    if (grouped && group.participantCount === 1) {
      warnings.push({
        id: `single-participant-group-${group.id}`,
        message: `O grupo "${group.name}" tem apenas 1 participante.`,
      });
    }
  }

  const groupsWithParticipants = groupSummaries.filter(
    (group) => group.participantCount > 0,
  );

  if (grouped && participantCount >= 2 && groupsWithParticipants.length >= 2) {
    const largestGroup = groupsWithParticipants.reduce((currentLargest, group) =>
      group.participantCount > currentLargest.participantCount
        ? group
        : currentLargest,
    );

    if (largestGroup.participantCount > participantCount / 2) {
      warnings.push({
        id: `dominant-group-${largestGroup.id}`,
        message: `O grupo "${largestGroup.name}" concentra mais da metade dos participantes (${largestGroup.participantCount} de ${participantCount}).`,
      });
    }
  }

  const validationError = getDrawValidationError(people, grouped);
  let blockingError = validationError;
  let groupedDrawPossible = false;
  let canDraw = false;

  if (!validationError) {
    const assignments = findSecretSantaAssignment(people, grouped);
    groupedDrawPossible = assignments !== null;
    canDraw = assignments !== null;

    if (!assignments) {
      blockingError =
        "Não foi possível formar pares válidos com a composição atual de grupos.";
    }
  }

  return {
    participantCount,
    groupCount: eventGroups.length,
    groupsWithParticipants: groupsWithParticipants.length,
    grouped,
    canDraw,
    groupedDrawPossible,
    blockingError,
    warnings,
    groups: groupSummaries,
  };
}
