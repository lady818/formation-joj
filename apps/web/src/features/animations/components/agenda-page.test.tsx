/**
 * La page /agenda, montée par sa vraie route sur la fausse API (`mocks/handlers.ts`) : l'agenda
 * d'un jour trié par heure de début, le filtre « en cours », et la journée sans animation.
 */
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { renderRoute } from '@/test/utils';

async function openDay(date: string) {
  const user = userEvent.setup();
  await renderRoute({ initialEntries: ['/agenda'] });
  const day = await screen.findByLabelText('Jour');
  await user.clear(day);
  await user.type(day, date);
  return user;
}

const shownTitles = () =>
  within(screen.getByRole('list', { name: 'Animations' }))
    .getAllByRole('listitem')
    .map((item) => item.getAttribute('aria-label'));

describe('AgendaPage', () => {
  it('002-AS1: shows the day agenda sorted by start time, with places', async () => {
    await openDay('2026-11-01');

    await waitFor(() =>
      expect(shownTitles()).toEqual([
        'Initiation au breaking',
        'Atelier lutte traditionnelle',
        'Concert de sabar',
      ]),
    );
    const lutte = screen.getByRole('listitem', { name: 'Atelier lutte traditionnelle' });
    expect(lutte).toHaveTextContent('Arène nationale');
    expect(lutte).toHaveTextContent('14:00 – 15:30');
  });

  it('002-AS3: keeps only what is in progress at 15:00', async () => {
    const user = await openDay('2026-11-01');
    await screen.findByRole('listitem', { name: 'Concert de sabar' });

    await user.type(screen.getByLabelText('En cours à'), '15:00');

    await waitFor(() => expect(shownTitles()).toEqual(['Atelier lutte traditionnelle']));
    expect(
      screen.getByRole('listitem', { name: 'Atelier lutte traditionnelle' }),
    ).toHaveTextContent('Arène nationale');
  });

  it('002-AS5: says there is no animation, without an error', async () => {
    await openDay('2026-11-03');

    expect(await screen.findByText('Aucune animation.')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});
