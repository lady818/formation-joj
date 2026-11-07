/**
 * La page /carte, montée par sa vraie route sur la fausse API (`mocks/handlers.ts`) : les lieux du
 * jour avec leurs animations, et le lien d'itinéraire vers chacun.
 */
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { renderRoute } from '@/test/utils';

describe('MapPage', () => {
  it('lists the venues of the day with their animations and directions', async () => {
    await renderRoute({ initialEntries: ['/carte'] });

    expect(await screen.findByRole('heading', { level: 1, name: 'Carte' })).toBeInTheDocument();
    const arene = await screen.findByRole('listitem', { name: 'Arène nationale' });
    expect(await within(arene).findByText('Atelier lutte traditionnelle')).toBeInTheDocument();
    expect(within(arene).getByText(/1 animation/)).toBeInTheDocument();
    expect(
      within(arene).getByRole('link', { name: 'Itinéraire vers Arène nationale' }),
    ).toHaveAttribute(
      'href',
      'https://www.google.com/maps/dir/?api=1&destination=14.758%2C-17.401',
    );
  });

  it('follows the day chosen with the day buttons', async () => {
    const user = userEvent.setup();
    await renderRoute({ initialEntries: ['/carte'] });
    const douta = await screen.findByRole('listitem', { name: 'Maison de la culture Douta Seck' });
    expect(within(douta).getByText(/rien ce jour-là/)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /lun\. 2/i }));

    expect(await within(douta).findByText('Tournoi de dames')).toBeInTheDocument();
  });
});
