import { describe, expect, it } from 'vitest';
import { Animation } from '../domain/animation';
import { InMemoryAnimationRepository } from './testing/in-memory-animation.repository';
import { GetDayAgenda } from './use-cases/get-day-agenda';

let nextId = 0;
const animation = (title: string, place: string, startsAt: string, endsAt: string) =>
  Animation.restore({
    id: `0199f5c2-0000-7000-8000-${String(++nextId).padStart(12, '0')}`,
    title,
    place,
    startsAt: new Date(startsAt),
    endsAt: new Date(endsAt),
    createdAt: new Date('2026-10-01T08:00:00.000Z'),
  });

const sabar = animation(
  'Concert de sabar',
  "Place de l'Obélisque",
  '2026-11-01T16:00:00Z',
  '2026-11-01T18:00:00Z',
);
const breaking = animation(
  'Initiation au breaking',
  'Village des Jeux, Diamniadio',
  '2026-11-01T10:00:00Z',
  '2026-11-01T12:00:00Z',
);
const lutte = animation(
  'Atelier lutte traditionnelle',
  'Arène nationale',
  '2026-11-01T14:00:00Z',
  '2026-11-01T15:30:00Z',
);
const dames = animation(
  'Tournoi de dames',
  'Maison de la culture Douta Seck',
  '2026-11-02T10:00:00Z',
  '2026-11-02T12:00:00Z',
);

const setup = (animations: Animation[] = [sabar, breaking, lutte, dames]) =>
  new GetDayAgenda(new InMemoryAnimationRepository(animations));

const titles = (animations: Animation[]) => animations.map((a) => a.title);

describe('animations (application layer)', () => {
  it('002-AS1: returns the day agenda sorted by start time, with places', async () => {
    const agenda = await setup().execute({ date: '2026-11-01' });

    expect(agenda.map((a) => [a.title, a.place])).toEqual([
      ['Initiation au breaking', 'Village des Jeux, Diamniadio'],
      ['Atelier lutte traditionnelle', 'Arène nationale'],
      ['Concert de sabar', "Place de l'Obélisque"],
    ]);
  });

  it('002-AS3: keeps only the animations in progress at the given time', async () => {
    const agenda = await setup().execute({ date: '2026-11-01', at: '15:00' });

    expect(titles(agenda)).toEqual(['Atelier lutte traditionnelle']);
    expect(agenda[0]?.place).toBe('Arène nationale');
  });

  it('002-AS5: returns an empty agenda without error', async () => {
    await expect(setup().execute({ date: '2026-11-03' })).resolves.toEqual([]);
    await expect(setup().execute({ date: '2026-11-01', at: '13:00' })).resolves.toEqual([]);
  });
});
