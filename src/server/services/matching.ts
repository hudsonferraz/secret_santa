export type MatchPerson = {
  id: number;
  id_group: number;
};

export type MatchAssignment = {
  id: number;
  match: number;
};

function shuffleInPlace(values: number[]) {
  for (let index = values.length - 1; index > 0; index--) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [values[index], values[swapIndex]] = [values[swapIndex], values[index]];
  }
}

function canAssign(
  people: MatchPerson[],
  grouped: boolean,
  giverIndex: number,
  receiverIndex: number,
): boolean {
  if (giverIndex === receiverIndex) return false;
  if (
    grouped &&
    people[giverIndex].id_group === people[receiverIndex].id_group
  ) {
    return false;
  }
  return true;
}

function hasMultipleGroups(people: MatchPerson[]): boolean {
  const groups = new Set(people.map((person) => person.id_group));
  return groups.size >= 2;
}

export function getDrawValidationError(
  people: MatchPerson[],
  grouped: boolean,
): string | null {
  if (people.length < 2) {
    return "É necessário pelo menos 2 participantes para realizar o sorteio.";
  }

  if (grouped && !hasMultipleGroups(people)) {
    return "Eventos com grupos precisam de participantes em pelo menos 2 grupos diferentes.";
  }

  return null;
}

function backtrack(
  people: MatchPerson[],
  grouped: boolean,
  giverIndex: number,
  receiverOrder: number[],
  assignment: number[],
  usedReceivers: Set<number>,
): boolean {
  if (giverIndex === people.length) return true;

  shuffleInPlace(receiverOrder);

  for (const receiverIndex of receiverOrder) {
    if (usedReceivers.has(receiverIndex)) continue;
    if (!canAssign(people, grouped, giverIndex, receiverIndex)) continue;

    assignment[giverIndex] = receiverIndex;
    usedReceivers.add(receiverIndex);

    if (
      backtrack(
        people,
        grouped,
        giverIndex + 1,
        receiverOrder,
        assignment,
        usedReceivers,
      )
    ) {
      return true;
    }

    usedReceivers.delete(receiverIndex);
  }

  return false;
}

export function findSecretSantaAssignment(
  people: MatchPerson[],
  grouped: boolean,
): MatchAssignment[] | null {
  const validationError = getDrawValidationError(people, grouped);
  if (validationError) return null;

  const receiverOrder = people.map((_, index) => index);
  const assignment = new Array<number>(people.length);

  for (let attempt = 0; attempt < 100; attempt++) {
    assignment.fill(-1);
    if (
      backtrack(
        people,
        grouped,
        0,
        [...receiverOrder],
        assignment,
        new Set<number>(),
      )
    ) {
      return assignment.map((receiverIndex, giverIndex) => ({
        id: people[giverIndex].id,
        match: people[receiverIndex].id,
      }));
    }
  }

  return null;
}
