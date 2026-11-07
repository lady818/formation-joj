import { describe, expect, it } from 'vitest';
import { agendaDay, instantOf, sortByStart } from './agenda';
import { Animation } from './animation';
import { AnimationError } from './animations.errors';

let nextId = 0;
const animation = (title: string, startsAt: string, endsAt: string) =>
  Animation.restore({
    id: `0199f5c2-0000-7000-8000-${String(++nextId).padStart(12, '0')}`,
    title,
    place: 'Village des Jeux, Diamniadio',
    startsAt: new Date(startsAt),
    endsAt: new Date(endsAt),
    createdAt: new Date('2026-10-01T08:00:00.000Z'),
  });

describe('agenda', () => {
  it('002-AS1: sorts by start time, then by title', () => {
    const sabar = animation('Concert de sabar', '2026-11-01T16:00:00Z', '2026-11-01T18:00:00Z');
    const breaking = animation(
      'Initiation au breaking',
      '2026-11-01T10:00:00Z',
      '2026-11-01T12:00:00Z',
    );
    const lutte = animation(
      'Atelier lutte traditionnelle',
      '2026-11-01T14:00:00Z',
      '2026-11-01T15:30:00Z',
    );
    const awale = animation('Atelier awalé', '2026-11-01T10:00:00Z', '2026-11-01T11:00:00Z');

    expect(sortByStart([sabar, breaking, lutte, awale]).map((a) => a.title)).toEqual([
      'Atelier awalé',
      'Initiation au breaking',
      'Atelier lutte traditionnelle',
      'Concert de sabar',
    ]);
  });

  it('002-AS6: accepts an existing day and a readable time, in Dakar time (UTC)', () => {
    expect(agendaDay('2026-11-01')).toEqual({
      from: new Date('2026-11-01T00:00:00.000Z'),
      to: new Date('2026-11-02T00:00:00.000Z'),
    });
    expect(instantOf('2026-11-01', '15:00')).toEqual(new Date('2026-11-01T15:00:00.000Z'));
  });

  it.each(['2026-11-31', '2026-02-29', '1er novembre', ''])(
    '002-AS6: rejects an invalid day (%j)',
    (date) => {
      expect(() => agendaDay(date)).toThrow(AnimationError);
      expect(() => agendaDay(date)).toThrow(
        expect.objectContaining({ code: 'AGENDA_DATE_INVALID', kind: 'VALIDATION' }),
      );
    },
  );

  it.each(['25:00', '15:60', '15h', '15:00:30'])('002-AS6: rejects an invalid time (%j)', (at) => {
    expect(() => instantOf('2026-11-01', at)).toThrow(AnimationError);
    expect(() => instantOf('2026-11-01', at)).toThrow(
      expect.objectContaining({ code: 'AGENDA_TIME_INVALID', kind: 'VALIDATION' }),
    );
  });
});
