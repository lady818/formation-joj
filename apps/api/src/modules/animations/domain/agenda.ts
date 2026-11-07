import type { Animation } from './animation';
import { AnimationError } from './animations.errors';

/** Les bornes d'un jour : de minuit inclus à minuit du lendemain exclu. */
export interface AgendaDay {
  from: Date;
  to: Date;
}

const DAY_MS = 24 * 60 * 60 * 1000;
const DATE_FORMAT = /^\d{4}-\d{2}-\d{2}$/;
const TIME_FORMAT = /^([01]\d|2[0-3]):[0-5]\d$/;

/**
 * Dakar est à UTC+0 toute l'année, sans heure d'été : un jour de Dakar est un jour UTC.
 * Lève AGENDA_DATE_INVALID si le jour n'existe pas (31 novembre) ou n'est pas `AAAA-MM-JJ`.
 */
export function agendaDay(date: string): AgendaDay {
  const from = new Date(`${date}T00:00:00.000Z`);
  // Date accepte le 31 novembre en le reportant au 1er décembre : on relit pour le refuser.
  if (!DATE_FORMAT.test(date) || Number.isNaN(from.getTime()) || isoDay(from) !== date) {
    throw new AnimationError('AGENDA_DATE_INVALID', `Invalid day ${date}`, { date });
  }
  return { from, to: new Date(from.getTime() + DAY_MS) };
}

/** L'instant `at` (`HH:MM`, heure de Dakar) du jour `date`. Lève AGENDA_TIME_INVALID. */
export function instantOf(date: string, at: string): Date {
  const { from } = agendaDay(date);
  if (!TIME_FORMAT.test(at)) {
    throw new AnimationError('AGENDA_TIME_INVALID', `Invalid time ${at}`, { at });
  }
  const [hours, minutes] = at.split(':').map(Number) as [number, number];
  return new Date(from.getTime() + (hours * 60 + minutes) * 60 * 1000);
}

/** Par heure de début, puis par nom quand deux animations commencent à la même heure. */
export function sortByStart(animations: Animation[]): Animation[] {
  return [...animations].sort(
    (a, b) => a.startsAt.getTime() - b.startsAt.getTime() || a.title.localeCompare(b.title, 'fr'),
  );
}

function isoDay(day: Date): string {
  return day.toISOString().slice(0, 10);
}
