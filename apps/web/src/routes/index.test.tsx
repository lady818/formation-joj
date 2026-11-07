/** La page d'accueil mène au guide : un clic sur « Voir l'agenda » ouvre l'agenda du jour. */
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { renderRoute } from '@/test/utils';

describe('Home', () => {
  it('002-AS1: leads from the home page to the day agenda', async () => {
    const user = userEvent.setup();
    const { router } = await renderRoute({ initialEntries: ['/'] });

    expect(
      await screen.findByRole('heading', { level: 1, name: 'Que faire maintenant à Dakar ?' }),
    ).toBeInTheDocument();
    await user.click(screen.getByRole('link', { name: 'Voir l’agenda' }));

    expect(await screen.findByRole('heading', { level: 1, name: 'Agenda' })).toBeInTheDocument();
    expect(router.state.location.pathname).toBe('/agenda');
  });
});
