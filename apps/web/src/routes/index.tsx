import { createFileRoute, Link } from '@tanstack/react-router';
import type { ReactNode } from 'react';
import { AYO_POSTER_SRC, AYO_SRC, Sparkles } from '@/components/ayo';
import { buttonVariants } from '@/components/ui/button';
import { useDayAgenda } from '@/features/animations/api/animations.queries';
import { DEMO_DATE, gamesStatus } from '@/lib/games';
import { useNow } from '@/lib/use-now';
import { cn } from '@/lib/utils';

/** Icônes au trait, dans la couleur du texte : elles remplacent les emojis. */
function Icon({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className={cn(
        'size-5 fill-none stroke-current stroke-2 [stroke-linecap:round] [stroke-linejoin:round]',
        className,
      )}
    >
      {children}
    </svg>
  );
}

const FEATURES = [
  {
    title: 'L’agenda du jour',
    text: 'Trié par heure de début, avec le lieu de chaque animation.',
    tone: 'bg-senegal-green text-white',
    to: '/agenda',
    icon: (
      <Icon>
        <rect x="3" y="5" width="18" height="16" rx="2" />
        <path d="M3 10h18M8 3v4M16 3v4" />
      </Icon>
    ),
  },
  {
    title: 'Ce qui est en cours',
    text: 'Une heure, ou « Maintenant », et il ne reste que l’essentiel.',
    tone: 'bg-senegal-yellow text-[oklch(0.3_0.06_80)]',
    to: '/agenda',
    icon: (
      <Icon>
        <circle cx="12" cy="13" r="8" />
        <path d="M12 9v4l2.5 2.5M9 2h6" />
      </Icon>
    ),
  },
  {
    title: 'Les disciplines',
    text: 'Athlétisme, lutte, sports nautiques : toutes les épreuves des Jeux.',
    tone: 'bg-senegal-red text-white',
    to: '/disciplines',
    icon: (
      <Icon>
        <circle cx="12" cy="9" r="6" />
        <path d="M8.5 14 7 22l5-3 5 3-1.5-8" />
      </Icon>
    ),
  },
] as const;

/** Les mots qui défilent dans le bandeau, aux couleurs des Jeux. */
const TICKER = [
  'Concerts',
  'Initiations',
  'Ateliers',
  'Rencontres avec Ayo',
  'Sports urbains',
  'Lutte sénégalaise',
  'Beach-volley',
  'Danse',
];

const clockFormat = new Intl.DateTimeFormat('fr-FR', {
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  timeZone: 'Africa/Dakar',
});
const timeFormat = new Intl.DateTimeFormat('fr-FR', {
  hour: '2-digit',
  minute: '2-digit',
  timeZone: 'Africa/Dakar',
});

/** L'heure de Dakar qui tourne, et où en sont les Jeux. */
function LiveStrip() {
  const now = useNow();
  const status = gamesStatus(now);
  const games =
    status.phase === 'before'
      ? `J-${status.daysLeft} avant les Jeux`
      : status.phase === 'during'
        ? `Jour ${status.day} sur ${status.total}`
        : 'Merci Dakar 2026 !';
  return (
    <div className="flex flex-wrap gap-2 text-sm font-semibold">
      <span className="flex items-center gap-2 rounded-full bg-white/15 px-3 py-1.5 ring-1 ring-white/25 backdrop-blur">
        <span className="relative flex size-2">
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-senegal-yellow opacity-75" />
          <span className="relative inline-flex size-2 rounded-full bg-senegal-yellow" />
        </span>
        Dakar, <time className="tabular-nums">{clockFormat.format(now)}</time>
      </span>
      <span className="rounded-full bg-white/15 px-3 py-1.5 ring-1 ring-white/25 backdrop-blur">
        {games}
      </span>
      <span className="rounded-full bg-white/15 px-3 py-1.5 ring-1 ring-white/25 backdrop-blur">
        31 oct. – 13 nov. 2026
      </span>
    </div>
  );
}

/** Les premières animations du jour de démo, lues dans l'API. */
function UpNext() {
  const agenda = useDayAgenda(DEMO_DATE);
  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold tracking-[0.2em] text-primary uppercase">Au programme</p>
          <h2 className="text-2xl font-extrabold tracking-tight">Le 1er novembre à Dakar</h2>
        </div>
        <Link
          to="/agenda"
          className="group flex shrink-0 items-center gap-1 text-sm font-semibold text-primary"
        >
          Tout l’agenda
          <Icon className="size-4 transition-transform group-hover:translate-x-1">
            <path d="M5 12h14M13 6l6 6-6 6" />
          </Icon>
        </Link>
      </div>
      {agenda.isLoading && (
        <div className="grid gap-3 sm:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-28 animate-pulse rounded-2xl bg-muted" />
          ))}
        </div>
      )}
      {agenda.isError && (
        <p className="rounded-xl bg-muted p-4 text-sm text-muted-foreground">
          Le programme n’est pas disponible pour le moment.
        </p>
      )}
      {agenda.isSuccess && (
        <ul className="grid gap-3 sm:grid-cols-3">
          {agenda.data.slice(0, 3).map((animation, index) => (
            <li
              key={animation.id}
              style={{ animationDelay: `${index * 90}ms` }}
              className="group relative overflow-hidden rounded-2xl border bg-card p-5 shadow-sm transition duration-500 animate-in fill-mode-both fade-in slide-in-from-bottom-3 hover:-translate-y-1 hover:shadow-lg"
            >
              <span
                aria-hidden="true"
                className="absolute -top-8 -right-8 size-20 rounded-full bg-senegal-yellow/30 transition-transform duration-500 group-hover:scale-150"
              />
              <p className="relative font-display text-2xl font-extrabold text-primary tabular-nums">
                {timeFormat.format(new Date(animation.startsAt))}
              </p>
              <p className="relative mt-1 font-semibold">{animation.title}</p>
              <p className="relative text-sm text-muted-foreground">{animation.place}</p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function Home() {
  return (
    <div className="flex flex-col gap-10">
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[oklch(0.38_0.12_152)] via-senegal-green to-sunset text-white shadow-2xl shadow-senegal-green/25 duration-700 animate-in animate-gradient fade-in slide-in-from-top-4">
        <span aria-hidden="true" className="absolute inset-0 pattern-diamonds" />
        <Sparkles />
        <div className="relative grid items-center gap-8 p-8 sm:p-10 md:grid-cols-[1.2fr_1fr]">
          <div>
            <p className="text-xs font-bold tracking-[0.2em] text-senegal-yellow uppercase">
              Jeux Olympiques de la Jeunesse · Dakar 2026
            </p>
            <h1 className="mt-3 text-4xl leading-[1.05] font-extrabold tracking-tight sm:text-5xl">
              Que faire maintenant à Dakar ?
            </h1>
            <p className="mt-4 max-w-lg text-lg text-white/90">
              Concerts, initiations, ateliers, rencontres avec Ayo, le lion de Dakar 2026 : toutes
              les animations du jour au même endroit, avec leur lieu et leurs horaires.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                to="/agenda"
                className={cn(
                  buttonVariants({ size: 'lg' }),
                  'h-12 rounded-full bg-senegal-yellow px-7 text-base font-bold text-[oklch(0.25_0.06_80)] shadow-lg transition-transform hover:scale-105 hover:bg-senegal-yellow',
                )}
              >
                Voir l’agenda
              </Link>
              <Link
                to="/disciplines"
                className={cn(
                  buttonVariants({ size: 'lg', variant: 'outline' }),
                  'h-12 rounded-full border-white/50 bg-white/10 px-7 text-base font-semibold text-white backdrop-blur hover:bg-white/20 hover:text-white',
                )}
              >
                Les disciplines
              </Link>
            </div>
            <div className="mt-8">
              <LiveStrip />
            </div>
          </div>
          <div className="relative mx-auto aspect-square w-60 sm:w-72">
            <span
              aria-hidden="true"
              className="absolute inset-0 rounded-full bg-senegal-yellow shadow-[0_0_80px_oklch(0.9_0.17_100/0.6)]"
            />
            <span
              aria-hidden="true"
              className="absolute -inset-5 animate-spin-slow rounded-full border-2 border-dashed border-white/40"
            />
            <img
              src={AYO_SRC}
              alt="Ayo, le lion mascotte officielle de Dakar 2026, qui salue de la main"
              className="absolute inset-3 size-[calc(100%-1.5rem)] animate-ayo-float rounded-full object-cover object-top ring-4 ring-white"
            />
            <span className="absolute -top-2 -left-8 z-10 rounded-2xl rounded-br-none bg-white px-4 py-2 font-display text-sm font-bold text-primary shadow-lg duration-500 animate-in fill-mode-both zoom-in-50 [animation-delay:600ms]">
              Salut, moi c’est Ayo !
            </span>
          </div>
        </div>
        <span aria-hidden="true" className="relative block h-3 pattern-zigzag" />
      </section>

      <div
        aria-hidden="true"
        className="-mx-4 -my-4 overflow-hidden border-y bg-senegal-yellow/40 py-3 sm:mx-0 sm:rounded-full sm:border"
      >
        <div className="flex w-max animate-marquee gap-8 font-display text-lg font-bold whitespace-nowrap text-[oklch(0.3_0.06_80)]">
          {[...TICKER, ...TICKER].map((word, index) => (
            <span key={`${word}-${index}`} className="flex items-center gap-8">
              {word}
              <span className="size-2 rotate-45 bg-senegal-red" />
            </span>
          ))}
        </div>
      </div>

      <UpNext />

      <ul className="grid gap-4 sm:grid-cols-3">
        {FEATURES.map(({ title, text, tone, icon, to }, index) => (
          <li
            key={title}
            style={{ animationDelay: `${150 + index * 100}ms` }}
            className="duration-500 animate-in fill-mode-both fade-in slide-in-from-bottom-3"
          >
            <Link
              to={to}
              className="group flex h-full flex-col rounded-2xl border bg-card p-5 shadow-sm transition hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg"
            >
              <span
                className={cn(
                  'grid size-11 place-items-center rounded-2xl transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6',
                  tone,
                )}
              >
                {icon}
              </span>
              <h2 className="mt-4 text-lg font-bold">{title}</h2>
              <p className="text-sm text-muted-foreground">{text}</p>
            </Link>
          </li>
        ))}
      </ul>

      <section className="relative grid items-center gap-8 overflow-hidden rounded-3xl bg-[oklch(0.96_0.05_95)] p-8 duration-700 animate-in fill-mode-both fade-in slide-in-from-bottom-4 [animation-delay:450ms] sm:grid-cols-[auto_1fr]">
        <img
          src={AYO_POSTER_SRC}
          alt="Affiche officielle : Ayo, le lion de Dakar 2026, dans le stade"
          className="mx-auto w-52 rotate-[-4deg] rounded-2xl shadow-2xl ring-8 ring-white transition-transform duration-500 hover:rotate-0 hover:scale-105"
        />
        <div>
          <p className="text-xs font-bold tracking-[0.2em] text-primary uppercase">
            La mascotte officielle
          </p>
          <h2 className="mt-1 text-3xl font-extrabold tracking-tight">
            Ayo, le lion de Dakar 2026
          </h2>
          <p className="mt-3 text-muted-foreground">
            Chapeau tressé sur la tête, maillot Dakar 2026 sur le dos, Ayo accueille les jeunes
            athlètes et le public du monde entier. Croise-le aux animations, fais une photo avec lui
            et partage l’énergie des Jeux.
          </p>
          <span aria-hidden="true" className="mt-5 block h-3 w-40 pattern-zigzag" />
        </div>
      </section>
    </div>
  );
}

export const Route = createFileRoute('/')({ component: Home });
