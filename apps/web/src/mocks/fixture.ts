import type { AnimationResponse, DisciplineResponse } from '@joj/shared';

/**
 * Les données de la fausse API, en mémoire. Les handlers les lisent et les modifient comme la
 * vraie base ; `resetFixture()` (appelé après chaque test par `mockControl.reset()`) les remet
 * dans cet état, pour qu'un test ne dépende jamais de ce qu'un autre a créé ou supprimé.
 */
export const lutte: DisciplineResponse = {
  id: '0199f5c2-0000-7000-8000-000000000003',
  name: 'Lutte',
  category: 'sports-de-combat',
  createdAt: '2026-10-01T08:00:00.000Z',
};

export const natation: DisciplineResponse = {
  id: '0199f5c2-0000-7000-8000-000000000004',
  name: 'Natation',
  category: 'sports-nautiques',
  createdAt: '2026-10-01T08:00:00.000Z',
};

/** Un identifiant au bon format qu'aucune discipline ne porte. */
export const UNKNOWN_ID = '0199f5c2-0000-7000-8000-00000000ffff';

/** Les animations des scénarios de la spec 002, dans le désordre : l'API les trie. */
export const animations: AnimationResponse[] = [
  {
    id: '0199f5c2-0000-7000-8000-000000000203',
    title: 'Concert de sabar',
    place: "Place de l'Obélisque",
    startsAt: '2026-11-01T16:00:00.000Z',
    endsAt: '2026-11-01T18:00:00.000Z',
  },
  {
    id: '0199f5c2-0000-7000-8000-000000000201',
    title: 'Initiation au breaking',
    place: 'Village des Jeux, Diamniadio',
    startsAt: '2026-11-01T10:00:00.000Z',
    endsAt: '2026-11-01T12:00:00.000Z',
  },
  {
    id: '0199f5c2-0000-7000-8000-000000000202',
    title: 'Atelier lutte traditionnelle',
    place: 'Arène nationale',
    startsAt: '2026-11-01T14:00:00.000Z',
    endsAt: '2026-11-01T15:30:00.000Z',
  },
  {
    id: '0199f5c2-0000-7000-8000-000000000204',
    title: 'Tournoi de dames',
    place: 'Maison de la culture Douta Seck',
    startsAt: '2026-11-02T10:00:00.000Z',
    endsAt: '2026-11-02T12:00:00.000Z',
  },
];

const initial = (): {
  disciplines: DisciplineResponse[];
  animations: AnimationResponse[];
} => ({
  disciplines: [{ ...lutte }, { ...natation }],
  animations: animations.map((animation) => ({ ...animation })),
});

export const fixture = initial();

export function resetFixture(): void {
  Object.assign(fixture, initial());
}
