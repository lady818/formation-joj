/** Un lieu des animations, placé sur la carte. Coordonnées approximatives (WGS 84). */
export type Venue = { name: string; area: string; lat: number; lng: number };

/** Les lieux des animations de démo (`apps/api/data/animations.json`), à vérifier sur place. */
export const VENUES: Venue[] = [
  { name: 'Corniche Ouest', area: 'Dakar', lat: 14.683, lng: -17.468 },
  { name: 'Place de l’Obélisque', area: 'Dakar', lat: 14.6905, lng: -17.448 },
  { name: 'Stade Iba Mar Diop', area: 'Médina, Dakar', lat: 14.6877, lng: -17.4527 },
  { name: 'Maison de la culture Douta Seck', area: 'Dakar', lat: 14.687, lng: -17.456 },
  { name: 'Monument de la Renaissance africaine', area: 'Ouakam', lat: 14.7222, lng: -17.495 },
  { name: 'Arène nationale', area: 'Pikine', lat: 14.758, lng: -17.401 },
  { name: 'Village des Jeux, Diamniadio', area: 'Diamniadio', lat: 14.724, lng: -17.183 },
];

/** Le centre de la carte : entre Dakar et Diamniadio. */
export const MAP_CENTER: [number, number] = [14.72, -17.34];

/** Compare deux noms de lieu sans tenir compte des apostrophes typographiques ni de la casse. */
const key = (name: string) =>
  name
    .replace(/[’']/g, "'")
    .trim()
    .toLowerCase();

/** Le lieu connu qui porte ce nom, s'il y en a un. */
export function findVenue(place: string): Venue | undefined {
  return VENUES.find((venue) => key(venue.name) === key(place));
}

/**
 * Le lien d'itinéraire Google Maps vers un lieu, depuis la position de la personne.
 * Avec des coordonnées connues on vise le point exact ; sinon on cherche le nom à Dakar.
 */
export function directionsUrl(place: string): string {
  const venue = findVenue(place);
  const destination = venue ? `${venue.lat},${venue.lng}` : `${place}, Dakar, Sénégal`;
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}`;
}
