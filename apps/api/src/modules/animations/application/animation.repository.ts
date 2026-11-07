import type { Animation } from '../domain/animation';

/**
 * Port de persistance : ce dont les cas d'usage ont besoin, rien de plus.
 * Implémenté par DrizzleAnimationRepository (infra) et InMemoryAnimationRepository (tests).
 */
export abstract class AnimationRepository {
  /** Les animations dont le début est dans [from, to), sans ordre garanti. */
  abstract listStartingBetween(from: Date, to: Date): Promise<Animation[]>;
}
