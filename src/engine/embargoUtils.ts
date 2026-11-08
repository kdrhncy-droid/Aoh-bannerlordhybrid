import type { DiplomaticRelation } from '../types/game';

type EmbargoRelation = Pick<
  DiplomaticRelation,
  'nationA' | 'nationB' | 'hasEmbargo' | 'embargoingNationIds'
>;

export function getEmbargoingNationIds(
  relation: EmbargoRelation
): string[] {
  if (Array.isArray(relation.embargoingNationIds)) {
    return Array.from(
      new Set(
        relation.embargoingNationIds.filter(
          (nationId) =>
            nationId === relation.nationA || nationId === relation.nationB
        )
      )
    );
  }

  // Legacy saves stored only a directionless flag; assign it to nationA so
  // the old flag never penalizes both parties at once.
  return relation.hasEmbargo ? [relation.nationA] : [];
}

export function isNationEmbargoing(
  relation: EmbargoRelation,
  nationId: string
): boolean {
  return getEmbargoingNationIds(relation).includes(nationId);
}

export function isNationEmbargoed(
  relation: EmbargoRelation,
  targetNationId: string
): boolean {
  const embargoingNationId =
    targetNationId === relation.nationA
      ? relation.nationB
      : targetNationId === relation.nationB
        ? relation.nationA
        : null;

  return embargoingNationId
    ? isNationEmbargoing(relation, embargoingNationId)
    : false;
}
