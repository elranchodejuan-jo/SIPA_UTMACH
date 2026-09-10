export interface Person {
  readonly id: string;
  readonly name: string;
  readonly portrait: string;
}

export interface PersonRelation {
  readonly personId: string;
}

export interface PersonRelationOptions<T extends PersonRelation> {
  readonly label?: string;
  readonly scopeField?: Extract<keyof T, string>;
}

export const people: readonly Readonly<Person>[];
export function getPerson(personId: string): Readonly<Person>;
export function assertValidPersonRelations<T extends PersonRelation>(
  relations: readonly T[],
  options?: PersonRelationOptions<T>,
): readonly T[];
