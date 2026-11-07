/** Les Jeux Olympiques de la Jeunesse de Dakar 2026 : du 31 octobre au 13 novembre 2026. */
export const GAMES_START = '2026-10-31';
export const GAMES_END = '2026-11-13';

const DAY_MS = 24 * 60 * 60 * 1000;

/** Tous les jours des Jeux, au format `AAAA-MM-JJ`. */
export function gamesDays(): string[] {
  const days: string[] = [];
  for (let t = Date.parse(GAMES_START); t <= Date.parse(GAMES_END); t += DAY_MS) {
    days.push(new Date(t).toISOString().slice(0, 10));
  }
  return days;
}

export type GamesStatus =
  | { phase: 'before'; daysLeft: number }
  | { phase: 'during'; day: number; total: number }
  | { phase: 'after' };

/** Où en sont les Jeux à l'instant `now` (Dakar est à UTC+0). */
export function gamesStatus(now: Date): GamesStatus {
  const today = Date.parse(now.toISOString().slice(0, 10));
  const start = Date.parse(GAMES_START);
  const end = Date.parse(GAMES_END);
  const total = Math.round((end - start) / DAY_MS) + 1;
  if (today < start) return { phase: 'before', daysLeft: Math.round((start - today) / DAY_MS) };
  if (today > end) return { phase: 'after' };
  return { phase: 'during', day: Math.round((today - start) / DAY_MS) + 1, total };
}

const dayChip = new Intl.DateTimeFormat('fr-FR', {
  weekday: 'short',
  day: 'numeric',
  timeZone: 'UTC',
});
const monthShort = new Intl.DateTimeFormat('fr-FR', { month: 'short', timeZone: 'UTC' });

/** « sam. 31 » et « oct. » pour une puce de jour. */
export function dayLabel(day: string): { day: string; month: string } {
  const date = new Date(`${day}T00:00:00Z`);
  return { day: dayChip.format(date), month: monthShort.format(date) };
}

/** Le jour des animations de démo (`apps/api/data/animations.json`) : l'agenda s'ouvre dessus. */
export const DEMO_DATE = '2026-11-01';
