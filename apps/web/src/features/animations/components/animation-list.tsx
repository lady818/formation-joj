import type { AnimationResponse } from '@joj/shared';
import { AyoAvatar } from '@/components/ayo';
import { Link } from '@tanstack/react-router';

/** Dakar est à UTC+0 : les heures s'affichent dans le fuseau de Dakar, quel que soit l'appareil. */
const timeFormat = new Intl.DateTimeFormat('fr-FR', {
  hour: '2-digit',
  minute: '2-digit',
  timeZone: 'Africa/Dakar',
});

const time = (iso: string) => timeFormat.format(new Date(iso));

/** Une couleur du Sénégal par carte, à tour de rôle : vert, jaune, rouge. */
const ACCENTS = [
  { bar: 'bg-senegal-green', pill: 'bg-senegal-green text-white' },
  { bar: 'bg-senegal-yellow', pill: 'bg-senegal-yellow text-[oklch(0.3_0.06_80)]' },
  { bar: 'bg-senegal-red', pill: 'bg-senegal-red text-white' },
] as const;

export function AnimationList({
  animations,
  inProgress = false,
  date,
}: {
  animations: AnimationResponse[];
  /** Vrai quand le filtre « en cours » est actif : chaque carte porte un repère « En cours ». */
  inProgress?: boolean;
  /** Le jour affiché : la carte s'ouvre sur ce jour. */
  date?: string;
}) {
  if (animations.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed bg-card p-10 text-center duration-500 animate-in fade-in zoom-in-95">
        <AyoAvatar className="size-24 animate-ayo-wave bg-senegal-yellow ring-4 ring-senegal-yellow/40" />
        <p className="text-muted-foreground">Aucune animation.</p>
        <p className="text-sm text-muted-foreground/80">
          Ayo se repose. Essaie une autre heure ou un autre jour !
        </p>
      </div>
    );
  }
  return (
    <ol aria-label="Animations" className="relative flex flex-col gap-4 pl-8">
      <span
        aria-hidden="true"
        className="absolute top-3 bottom-3 left-3 w-0.5 rounded-full bg-gradient-to-b from-senegal-green via-senegal-yellow to-senegal-red"
      />
      {animations.map((animation, index) => {
        const accent = ACCENTS[index % ACCENTS.length] ?? ACCENTS[0];
        return (
          <li
            key={animation.id}
            aria-label={animation.title}
            style={{ animationDelay: `${index * 70}ms` }}
            className="group relative duration-500 animate-in fill-mode-both fade-in slide-in-from-left-3"
          >
            <span
              aria-hidden="true"
              className={`absolute top-1/2 -left-[1.6rem] size-4 -translate-y-1/2 rounded-full ring-4 ring-background transition-transform group-hover:scale-125 ${accent.bar}`}
            />
            <div className="flex flex-col gap-3 rounded-2xl border bg-card p-4 shadow-sm transition duration-300 group-hover:-translate-y-0.5 group-hover:border-primary/30 group-hover:shadow-lg sm:flex-row sm:items-center sm:gap-5">
              <span
                className={`w-fit shrink-0 rounded-full px-3 py-1 text-sm font-bold tabular-nums ${accent.pill}`}
              >
                {time(animation.startsAt)} – {time(animation.endsAt)}
              </span>
              <div className="flex min-w-0 flex-col">
                <span className="font-display text-lg font-bold leading-tight">
                  {animation.title}
                </span>
                <span className="mt-0.5 flex items-center gap-1 text-sm text-muted-foreground">
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                    className="size-4 shrink-0 fill-none stroke-current stroke-2"
                  >
                    <path d="M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11z" />
                    <circle cx="12" cy="10" r="2.5" />
                  </svg>
                  {animation.place}
                </span>
              </div>
              <div className="flex shrink-0 items-center gap-2 sm:ml-auto">
                {inProgress && (
                  <span className="flex w-fit shrink-0 items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                    <span className="relative flex size-2">
                      <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary opacity-60" />
                      <span className="relative inline-flex size-2 rounded-full bg-primary" />
                    </span>
                    En cours
                  </span>
                )}
                <Link
                  to="/carte"
                  search={{ lieu: animation.place, ...(date ? { jour: date } : {}) }}
                  aria-label={`Voir ${animation.place} sur la carte`}
                  className="inline-flex w-fit shrink-0 items-center gap-1.5 rounded-full bg-senegal-yellow px-3 py-1.5 text-xs font-bold text-[oklch(0.25_0.06_80)] shadow-sm transition hover:scale-105"
                >
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                    className="size-3.5 fill-none stroke-current stroke-[2.5] [stroke-linecap:round] [stroke-linejoin:round]"
                  >
                    <path d="m3 11 18-8-8 18-2-8z" />
                  </svg>
                  Y aller
                </Link>
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
