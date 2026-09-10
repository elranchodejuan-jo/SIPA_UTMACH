export interface Person {
  readonly id: string;
  readonly name: string;
  readonly portrait: string;
  readonly status: 'confirmed' | 'draft';
  readonly academicProfile?: Readonly<AcademicProfile>;
  readonly contacts: readonly Readonly<PersonContact>[];
}

export interface AcademicCredential {
  readonly degree: string;
  readonly institution: string;
  readonly country: string;
}

export interface AcademicProfile {
  readonly credentials: readonly Readonly<AcademicCredential>[];
  readonly trajectory: readonly string[];
  readonly areas: readonly string[];
}

export interface PersonContact {
  readonly type: 'email' | 'googleScholar' | 'instagram' | 'linkedin' | 'orcid' | 'whatsapp';
  readonly label: string;
  readonly url: string;
  readonly published: boolean;
  readonly status: 'confirmed' | 'draft' | 'hidden';
}

export interface PersonRelation {
  readonly personId: string;
}

export interface PersonRelationOptions<T extends PersonRelation> {
  readonly label?: string;
  readonly scopeField?: Extract<keyof T, string>;
}

export const people: readonly Readonly<Person>[];
export const draftPeople: readonly Readonly<Person>[];
export function getPerson(personId: string): Readonly<Person>;
export function assertValidPersonRelations<T extends PersonRelation>(
  relations: readonly T[],
  options?: PersonRelationOptions<T>,
): readonly T[];
