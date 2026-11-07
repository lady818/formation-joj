import { directionsUrl } from '@/lib/places';
import { cn } from '@/lib/utils';

/** Le lien « Y aller » : l'itinéraire Google Maps depuis la position de la personne. */
export function DirectionsLink({ place, className }: { place: string; className?: string }) {
  return (
    <a
      href={directionsUrl(place)}
      target="_blank"
      rel="noreferrer"
      aria-label={`Itinéraire vers ${place}`}
      className={cn(
        'inline-flex w-fit shrink-0 items-center gap-1.5 rounded-full bg-senegal-yellow px-3 py-1.5 text-xs font-bold text-[oklch(0.25_0.06_80)] shadow-sm transition hover:scale-105',
        className,
      )}
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        className="size-3.5 fill-none stroke-current stroke-[2.5] [stroke-linecap:round] [stroke-linejoin:round]"
      >
        <path d="m3 11 18-8-8 18-2-8z" />
      </svg>
      Y aller
    </a>
  );
}
