/** Les lieux sur la carte, et le lien d'itinéraire vers chacun. */
import { describe, expect, it } from 'vitest';
import { directionsUrl, findVenue } from './places';

describe('places', () => {
  it('finds a venue whatever the apostrophe', () => {
    expect(findVenue("Place de l'Obélisque")?.area).toBe('Dakar');
    expect(findVenue('place de l’obélisque')).toBeDefined();
  });

  it('points the directions at the coordinates of a known venue', () => {
    expect(directionsUrl('Arène nationale')).toBe(
      'https://www.google.com/maps/dir/?api=1&destination=14.758%2C-17.401',
    );
  });

  it('searches an unknown place by name in Dakar', () => {
    expect(directionsUrl('Plage de Yoff')).toBe(
      'https://www.google.com/maps/dir/?api=1&destination=Plage%20de%20Yoff%2C%20Dakar%2C%20S%C3%A9n%C3%A9gal',
    );
  });
});
