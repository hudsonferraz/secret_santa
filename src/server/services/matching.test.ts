import { describe, expect, it } from "vitest";
import {
  findSecretSantaAssignment,
  getDrawValidationError,
  type MatchAssignment,
  type MatchPerson,
} from "./matching";

function buildPeople(
  groupSizes: Record<number, number>,
  startId = 1,
): MatchPerson[] {
  const people: MatchPerson[] = [];
  let nextId = startId;

  for (const [groupId, size] of Object.entries(groupSizes)) {
    for (let index = 0; index < size; index++) {
      people.push({ id: nextId, id_group: Number(groupId) });
      nextId += 1;
    }
  }

  return people;
}

function assertValidAssignment(
  people: MatchPerson[],
  grouped: boolean,
  assignments: MatchAssignment[] | null,
) {
  expect(assignments).not.toBeNull();

  const peopleById = new Map(people.map((person) => [person.id, person]));
  const assignmentByGiverId = new Map(
    assignments!.map((assignment) => [assignment.id, assignment.match]),
  );

  expect(assignmentByGiverId.size).toBe(people.length);

  const receiverIds: number[] = [];

  for (const person of people) {
    const receiverId = assignmentByGiverId.get(person.id);
    expect(receiverId).toBeDefined();
    expect(receiverId).not.toBe(person.id);

    const receiver = peopleById.get(receiverId!);
    expect(receiver).toBeDefined();

    if (grouped) {
      expect(receiver!.id_group).not.toBe(person.id_group);
    }

    receiverIds.push(receiverId!);
  }

  expect(new Set(receiverIds).size).toBe(people.length);
}

describe("getDrawValidationError", () => {
  it("requires at least two participants", () => {
    expect(getDrawValidationError([], false)).toBe(
      "É necessário pelo menos 2 participantes para realizar o sorteio.",
    );
    expect(getDrawValidationError([{ id: 1, id_group: 1 }], false)).toBe(
      "É necessário pelo menos 2 participantes para realizar o sorteio.",
    );
  });

  it("requires participants in at least two groups for grouped events", () => {
    const singleGroupPeople = buildPeople({ 1: 3 });

    expect(getDrawValidationError(singleGroupPeople, true)).toBe(
      "Eventos com grupos precisam de participantes em pelo menos 2 grupos diferentes.",
    );
  });
});

describe("findSecretSantaAssignment", () => {
  describe("two participants", () => {
    it("assigns the only other participant when groups are not enforced", () => {
      const people = buildPeople({ 1: 2 });
      const assignments = findSecretSantaAssignment(people, false);

      assertValidAssignment(people, false, assignments);
      expect(assignments).toEqual([
        { id: people[0].id, match: people[1].id },
        { id: people[1].id, match: people[0].id },
      ]);
    });

    it("assigns across groups when grouped draw is enabled", () => {
      const people = buildPeople({ 10: 1, 20: 1 });
      const assignments = findSecretSantaAssignment(people, true);

      assertValidAssignment(people, true, assignments);
      expect(assignments).toEqual([
        { id: people[0].id, match: people[1].id },
        { id: people[1].id, match: people[0].id },
      ]);
    });

    it("returns null when both participants are in the same grouped event", () => {
      const people = buildPeople({ 10: 2 });

      expect(getDrawValidationError(people, true)).toBe(
        "Eventos com grupos precisam de participantes em pelo menos 2 grupos diferentes.",
      );
      expect(findSecretSantaAssignment(people, true)).toBeNull();
    });
  });

  describe("grouped events with two balanced groups", () => {
    it("finds a valid assignment for evenly split groups", () => {
      const people = buildPeople({ 10: 3, 20: 3 });
      const assignments = findSecretSantaAssignment(people, true);

      assertValidAssignment(people, true, assignments);
    });

    it("finds a valid assignment for small balanced groups", () => {
      const people = buildPeople({ 10: 2, 20: 2 });
      const assignments = findSecretSantaAssignment(people, true);

      assertValidAssignment(people, true, assignments);
    });

    it("finds a valid assignment for equal larger groups", () => {
      const people = buildPeople({ 10: 4, 20: 4 });
      const assignments = findSecretSantaAssignment(people, true);

      assertValidAssignment(people, true, assignments);
    });

    it("returns null for two groups with unequal sizes even when validation passes", () => {
      const people = buildPeople({ 10: 3, 20: 2 });

      expect(getDrawValidationError(people, true)).toBeNull();
      expect(findSecretSantaAssignment(people, true)).toBeNull();
    });
  });

  describe("grouped events with one group too large", () => {
    it("returns null when one group has five people and the other has one", () => {
      const people = buildPeople({ 10: 5, 20: 1 });

      expect(getDrawValidationError(people, true)).toBeNull();
      expect(findSecretSantaAssignment(people, true)).toBeNull();
    });

    it("returns null when one group has four people and the other has two", () => {
      const people = buildPeople({ 10: 4, 20: 2 });

      expect(getDrawValidationError(people, true)).toBeNull();
      expect(findSecretSantaAssignment(people, true)).toBeNull();
    });

    it("returns null when one group dominates more than half of participants", () => {
      const people = buildPeople({ 10: 4, 20: 3 });

      expect(findSecretSantaAssignment(people, true)).toBeNull();
    });
  });

  describe("reset and re-run behavior", () => {
    const people = buildPeople({ 10: 2, 20: 2 });

    it("still finds valid assignments on repeated runs after a reset", () => {
      for (let run = 0; run < 25; run++) {
        const assignments = findSecretSantaAssignment(people, true);
        assertValidAssignment(people, true, assignments);
      }
    });

    it("can produce different valid assignments across re-runs", () => {
      const serializedAssignments = new Set<string>();

      for (let run = 0; run < 50; run++) {
        const assignments = findSecretSantaAssignment(people, true);
        assertValidAssignment(people, true, assignments);

        const normalized = JSON.stringify(
          [...assignments!].sort(
            (left, right) => left.id - right.id || left.match - right.match,
          ),
        );
        serializedAssignments.add(normalized);
      }

      expect(serializedAssignments.size).toBeGreaterThan(1);
    });

    it("remains valid after alternating failed preview checks and successful draws", () => {
      const tooLargePeople = buildPeople({ 10: 5, 20: 1 });
      const balancedPeople = buildPeople({ 10: 2, 20: 2 }, 100);

      expect(findSecretSantaAssignment(tooLargePeople, true)).toBeNull();

      for (let run = 0; run < 10; run++) {
        const assignments = findSecretSantaAssignment(balancedPeople, true);
        assertValidAssignment(balancedPeople, true, assignments);
      }

      expect(findSecretSantaAssignment(tooLargePeople, true)).toBeNull();
    });
  });
});
