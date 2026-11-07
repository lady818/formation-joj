import type { AnimationResponse } from '@joj/shared';
import { lazy, Suspense, useMemo, useState } from 'react';
import { DirectionsLink } from '@/components/directions-link';
import { PageHero } from '@/components/page-hero';
import { Button } from '@/components/ui/button';
import { useDayAgenda } from '@/features/animations/api/animations.queries';
import { DayPicker } from '@/features/animations/components/day-picker';
import { DEMO_DATE } from '@/lib/games';
import { findVenue, VENUES } from '@/lib/places';
import { cn } from '@/lib/utils';

/** Leaflet n'est chargé qu'à l'ouverture de la carte : les autres pages restent légères. */
const VenueMap = lazy(() => import('./venue-map').then((m) => ({ default: m.VenueMap })));

const timeFormat = new Intl.DateTimeFormat('fr-FR', {
  hour: '2-digit',
  minute: '2-digit',
  timeZone: 'Africa/Dakar',
});
const time = (iso: string) => timeFormat.format(new Date(iso));

export function MapPage({
  initialPlace,
  initialDate,
}: {
  /** Le lieu à montrer dès l'ouverture, par exemple depuis « Y aller » sur l'accueil. */
  initialPlace?: string | undefined;
  initialDate?: string | undefined;
} = {}) {
  const [date, setDate] = useState(initialDate ?? DEMO_DATE);
  const [selected, setSelected] = useState<string | null>(
    initialPlace ? (findVenue(initialPlace)?.name ?? null) : null,
  );
  const [me, setMe] = useState<[number, number] | null>(null);
  const [locating, setLocating] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);
  const agenda = useDayAgenda(date);

  /** Les animations du jour, rangées par lieu connu. */
  const byVenue = useMemo(() => {
    const groups: Record<string, AnimationResponse[]> = {};
    for (const animation of agenda.data ?? []) {
      const venue = findVenue(animation.place);
      if (venue) (groups[venue.name] ??= []).push(animation);
    }
    return groups;
  }, [agenda.data]);
  const counts = useMemo(
    () => Object.fromEntries(VENUES.map((v) => [v.name, byVenue[v.name]?.length ?? 0])),
    [byVenue],
  );
  // Les lieux animés ce jour-là d'abord.
  const venues = [...VENUES].sort((a, b) => (counts[b.name] ?? 0) - (counts[a.name] ?? 0));

  function locate() {
    if (!('geolocation' in navigator)) {
      setGeoError('Ton appareil ne donne pas sa position.');
      return;
    }
    setLocating(true);
    setGeoError(null);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setMe([position.coords.latitude, position.coords.longitude]);
        setLocating(false);
      },
      () => {
        setGeoError('Position refusée ou introuvable.');
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10_000 },
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHero eyebrow="Se repérer à Dakar" title="Carte">
        <p className="-mt-4 max-w-md text-white/90">
          Les lieux des animations du jour. Choisis un lieu, puis « Y aller » pour l’itinéraire
          depuis l’endroit où tu es.
        </p>
        <div className="mt-5">
          <DayPicker value={date} onChange={setDate} />
        </div>
      </PageHero>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="flex flex-col gap-3 lg:sticky lg:top-24 lg:self-start">
          <Suspense
            fallback={<div className="h-80 animate-pulse rounded-3xl bg-muted sm:h-[32rem]" />}
          >
            <VenueMap
              venues={VENUES}
              counts={counts}
              selected={selected}
              me={me}
              onSelect={setSelected}
            />
          </Suspense>
          <div className="flex flex-wrap items-center gap-3">
            <Button type="button" className="rounded-full" disabled={locating} onClick={locate}>
              {locating ? 'Localisation…' : 'Me localiser'}
            </Button>
            {me && !geoError && (
              <span className="text-sm text-muted-foreground">Le point bleu, c’est toi.</span>
            )}
            {geoError && (
              <span role="alert" className="text-sm text-destructive">
                {geoError}
              </span>
            )}
          </div>
        </div>

        <ul aria-label="Lieux" className="flex flex-col gap-3">
          {venues.map((venue) => {
            const animations = byVenue[venue.name] ?? [];
            const active = venue.name === selected;
            return (
              <li
                key={venue.name}
                aria-label={venue.name}
                className={cn(
                  'rounded-2xl border bg-card p-4 shadow-sm transition',
                  active && 'border-senegal-yellow ring-4 ring-senegal-yellow/40',
                  animations.length === 0 && 'opacity-70',
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <button
                    type="button"
                    aria-pressed={active}
                    onClick={() => setSelected(venue.name)}
                    className="text-left"
                  >
                    <span className="block font-display text-lg font-bold leading-tight hover:text-primary">
                      {venue.name}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {venue.area} ·{' '}
                      {animations.length === 0
                        ? 'rien ce jour-là'
                        : `${animations.length} animation${animations.length > 1 ? 's' : ''}`}
                    </span>
                  </button>
                  <DirectionsLink place={venue.name} />
                </div>
                {animations.length > 0 && (
                  <ul className="mt-3 flex flex-col gap-1.5 border-t pt-3">
                    {animations.map((animation) => (
                      <li key={animation.id} className="flex gap-3 text-sm">
                        <span className="shrink-0 font-bold text-primary tabular-nums">
                          {time(animation.startsAt)}
                        </span>
                        <span>{animation.title}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      </div>
      <p className="text-xs text-muted-foreground">
        Emplacements indicatifs. L’itinéraire s’ouvre dans Google Maps.
      </p>
    </div>
  );
}
