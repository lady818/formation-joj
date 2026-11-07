import type { Animation } from '../../domain/animation';
import { AnimationRepository } from '../animation.repository';

/** Fake fidèle au contrat du port (début dans [from, to)), pour tester l'application sans base. */
export class InMemoryAnimationRepository extends AnimationRepository {
  constructor(private readonly animations: Animation[] = []) {
    super();
  }

  async listStartingBetween(from: Date, to: Date): Promise<Animation[]> {
    return this.animations.filter(
      (animation) =>
        animation.startsAt.getTime() >= from.getTime() &&
        animation.startsAt.getTime() < to.getTime(),
    );
  }
}
