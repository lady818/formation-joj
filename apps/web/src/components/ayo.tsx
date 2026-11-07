import { cn } from '@/lib/utils';

/** Ayo, le lion mascotte officielle des JOJ Dakar 2026 (portrait recadré de l'affiche). */
export const AYO_SRC = '/ayo.jpg';
/** L'affiche officielle complète d'Ayo. */
export const AYO_POSTER_SRC = '/ayo-poster.jpg';

/** Ayo dans un médaillon rond. `alt` vide quand l'image n'est que décorative. */
export function AyoAvatar({ className, alt = '' }: { className?: string; alt?: string }) {
  return (
    <img
      src={AYO_SRC}
      alt={alt}
      className={cn('rounded-full object-cover object-top ring-2 ring-white shadow-md', className)}
    />
  );
}

/** Petites étoiles aux couleurs du Sénégal qui scintillent en fond de bandeau. */
export function Sparkles() {
  const dots = [
    { top: '12%', left: '8%', color: 'bg-senegal-yellow', delay: '0s', size: 'size-2' },
    { top: '70%', left: '14%', color: 'bg-white', delay: '0.8s', size: 'size-1.5' },
    { top: '30%', left: '46%', color: 'bg-senegal-yellow', delay: '1.4s', size: 'size-1.5' },
    { top: '82%', left: '52%', color: 'bg-senegal-red', delay: '0.4s', size: 'size-2' },
    { top: '18%', left: '62%', color: 'bg-white', delay: '2s', size: 'size-1' },
  ];
  return (
    <span aria-hidden="true" className="pointer-events-none absolute inset-0">
      {dots.map((dot) => (
        <span
          key={`${dot.top}-${dot.left}`}
          style={{ top: dot.top, left: dot.left, animationDelay: dot.delay }}
          className={cn('absolute animate-twinkle rounded-full', dot.color, dot.size)}
        />
      ))}
    </span>
  );
}
