import { describe, expect, it } from 'vitest';
import { Animation } from './animation';

const animation = (title: string, startsAt: string, endsAt: string) =>
  Animation.restore({
    id: '0199f5c2-0000-7000-8000-000000000201',
    title,
    place: 'Arène nationale',
    startsAt: new Date(startsAt),
    endsAt: new Date(endsAt),
    createdAt: new Date('2026-10-01T08:00:00.000Z'),
  });

describe('Animation', () => {
  it('002-AS4: in progress from the start, until the end excluded', () => {
    const lutte = animation(
      'Atelier lutte traditionnelle',
      '2026-11-01T14:00:00.000Z',
      '2026-11-01T15:00:00.000Z',
    );
    const taekwondo = animation(
      'Démonstration de taekwondo',
      '2026-11-01T15:00:00.000Z',
      '2026-11-01T16:00:00.000Z',
    );
    const threePm = new Date('2026-11-01T15:00:00.000Z');

    expect(lutte.isInProgressAt(threePm)).toBe(false);
    expect(taekwondo.isInProgressAt(threePm)).toBe(true);
    expect(lutte.isInProgressAt(new Date('2026-11-01T14:59:59.999Z'))).toBe(true);
    expect(taekwondo.isInProgressAt(new Date('2026-11-01T14:59:59.999Z'))).toBe(false);
  });
});
