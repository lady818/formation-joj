import type { AnimationResponse } from '@joj/shared';

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
}: {
  animations: AnimationResponse[];
  /** Vrai quand le filtre « en cours » est actif : chaque carte porte un repère « En cours ». */
  inProgress?: boolean;
}) {
  if (animations.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed bg-card p-10 text-center duration-500 animate-in fade-in zoom-in-95">
        <span aria-hidden="true" className="text-5xl">
          🦁
        </span>
        <p className="text-muted-foreground">Aucune animation.</p>
      </div>
    );
  }
  return (
    <ul aria-label="Animations" className="flex flex-col gap-3">
      {animations.map((animation, index) => {
        const accent = ACCENTS[index % ACCENTS.length] ?? ACCENTS[0];
        return (
          <li
            key={animation.id}
            aria-label={animation.title}
            style={{ animationDelay: `${index * 70}ms` }}
            className="group relative flex items-center gap-4 overflow-hidden rounded-xl border bg-card p-4 pl-5 shadow-sm transition duration-500 animate-in fill-mode-both fade-in slide-in-from-bottom-3 hover:-translate-y-0.5 hover:shadow-md"
          >
            <span aria-hidden="true" className={`absolute inset-y-0 left-0 w-1.5 ${accent.bar}`} />
            <span
              className={`shrink-0 rounded-full px-3 py-1 text-sm font-semibold tabular-nums ${accent.pill}`}
            >
              {time(animation.startsAt)} – {time(animation.endsAt)}
            </span>
            <div className="flex min-w-0 flex-col">
              <span className="font-semibold">{animation.title}</span>
              <span className="flex items-center gap-1 text-sm text-muted-foreground">
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
            {inProgress && (
              <span className="ml-auto flex shrink-0 items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                <span className="relative flex size-2">
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary opacity-60" />
                  <span className="relative inline-flex size-2 rounded-full bg-primary" />
                </span>
                En cours
              </span>
            )}
          </li>
        );
      })}
    </ul>
  );
}
