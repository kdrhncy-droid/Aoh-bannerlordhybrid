import type { Nation } from '../types/game';

type NationTechState = Pick<Nation, 'unlockedTechs'> | null | undefined;

/** ADM_1 reduces only positive unrest drift in non-core provinces by 30%. */
export function adjustOccupiedUnrestDrift(
  nation: NationTechState,
  baseDrift: number
): number {
  if (baseDrift <= 0 || !nation?.unlockedTechs?.includes('adm_1')) {
    return baseDrift;
  }
  return Number((baseDrift * 0.7).toFixed(2));
}

/** ADM_2 reduces positive aggressive-expansion gains by 25%; losses are unchanged. */
export function adjustAggressiveExpansionGain(
  nation: NationTechState,
  baseGain: number
): number {
  if (baseGain <= 0 || !nation?.unlockedTechs?.includes('adm_2')) {
    return baseGain;
  }
  return Number((baseGain * 0.75).toFixed(2));
}
