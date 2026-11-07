/** Le calendrier des Jeux : les 14 jours, et où l'on en est à une date donnée. */
import { describe, expect, it } from 'vitest';
import { gamesDays, gamesStatus } from './games';

describe('games', () => {
  it('lists the 14 days of the Games, from 31 October to 13 November 2026', () => {
    const days = gamesDays();
    expect(days).toHaveLength(14);
    expect(days[0]).toBe('2026-10-31');
    expect(days.at(-1)).toBe('2026-11-13');
  });

  it('counts the days left before the Games', () => {
    expect(gamesStatus(new Date('2026-10-28T12:00:00Z'))).toEqual({ phase: 'before', daysLeft: 3 });
  });

  it('numbers the current day during the Games', () => {
    expect(gamesStatus(new Date('2026-11-07T23:59:00Z'))).toEqual({
      phase: 'during',
      day: 8,
      total: 14,
    });
  });

  it('says when the Games are over', () => {
    expect(gamesStatus(new Date('2026-11-14T00:00:00Z'))).toEqual({ phase: 'after' });
  });
});
