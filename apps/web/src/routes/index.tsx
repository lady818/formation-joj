import { createFileRoute, Link } from '@tanstack/react-router';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

function Home() {
  return (
    <div className="flex flex-col gap-6">
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-senegal-green via-[oklch(0.62_0.15_130)] to-sunset p-8 text-white shadow-lg duration-700 animate-in fade-in slide-in-from-top-4">
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -right-6 -bottom-8 text-[9rem] opacity-25 select-none"
        >
          🦁
        </span>
        <p className="text-sm font-semibold tracking-widest text-white/80 uppercase">
          Jeux Olympiques de la Jeunesse · Dakar 2026
        </p>
        <h1 className="mt-2 text-4xl font-extrabold tracking-tight">
          Que faire maintenant à Dakar ?
        </h1>
        <p className="mt-3 max-w-lg text-white/90">
          Concerts, initiations, ateliers, rencontres avec Ayo, le lion de Dakar 2026 : toutes les
          animations du jour au même endroit, avec leur lieu et leurs horaires.
        </p>
        <Link
          to="/agenda"
          className={cn(
            buttonVariants({ size: 'lg' }),
            'mt-6 bg-white font-semibold text-primary hover:bg-white/90',
          )}
        >
          Voir l’agenda
        </Link>
      </section>
      <ul className="grid gap-3 sm:grid-cols-3">
        {[
          ['📅', 'L’agenda du jour', 'Trié par heure de début, avec le lieu de chaque animation.'],
          [
            '⏱️',
            'Ce qui est en cours',
            'Une heure, ou « Maintenant », et il ne reste que l’essentiel.',
          ],
          ['🦁', 'Avec Ayo', 'Retrouve la mascotte des JOJ pendant toute la durée des Jeux.'],
        ].map(([icon, title, text], index) => (
          <li
            key={title}
            style={{ animationDelay: `${150 + index * 100}ms` }}
            className="rounded-xl border bg-card p-4 shadow-sm duration-500 animate-in fill-mode-both fade-in slide-in-from-bottom-3"
          >
            <span aria-hidden="true" className="text-2xl">
              {icon}
            </span>
            <h2 className="mt-2 font-semibold">{title}</h2>
            <p className="text-sm text-muted-foreground">{text}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

export const Route = createFileRoute('/')({ component: Home });
