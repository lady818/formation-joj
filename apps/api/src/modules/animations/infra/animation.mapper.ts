import { Animation } from '../domain/animation';
import type { AnimationRow } from './animations.schema';

/** Ligne de la table → entité. */
export function toDomain(row: AnimationRow): Animation {
  return Animation.restore({
    id: row.id,
    title: row.title,
    place: row.place,
    startsAt: row.startsAt,
    endsAt: row.endsAt,
    createdAt: row.createdAt,
  });
}
