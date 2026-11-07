import { createRootRoute, Link, Outlet } from '@tanstack/react-router';
import { AyoAvatar } from '@/components/ayo';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const NAV = [
  { to: '/', label: 'Accueil', exact: true },
  { to: '/agenda', label: 'Agenda', exact: false },
  { to: '/carte', label: 'Carte', exact: false },
  { to: '/disciplines', label: 'Disciplines', exact: false },
] as const;

function RootLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Bandeau aux couleurs du Sénégal : vert, jaune, rouge. */}
      <div aria-hidden="true" className="flex h-1.5">
        <span className="flex-1 bg-senegal-green" />
        <span className="flex-1 bg-senegal-yellow" />
        <span className="flex-1 bg-senegal-red" />
      </div>
      <header className="sticky top-0 z-30 border-b border-border/60 bg-background/75 backdrop-blur-lg">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <Link
            to="/"
            className="group flex shrink-0 items-center gap-2.5 font-display text-lg font-extrabold tracking-tight"
          >
            <AyoAvatar className="size-10 bg-senegal-yellow ring-senegal-yellow transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6" />
            <span className="sr-only sm:not-sr-only">
              Ayo <span className="text-primary">Guide</span>
            </span>
          </Link>
          <nav aria-label="Navigation principale">
            <ul className="flex gap-0.5 rounded-full border bg-card/80 p-1 shadow-sm">
              {NAV.map((item) => (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    activeOptions={{ exact: item.exact }}
                    className="block rounded-full px-2.5 py-1.5 text-sm font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground sm:px-4"
                    activeProps={{
                      className: 'bg-primary text-primary-foreground! hover:bg-primary shadow-sm',
                      'aria-current': 'page',
                    }}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </header>
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 px-4 py-8 sm:px-6">
        <Outlet />
      </main>
      <footer className="mt-8 bg-[oklch(0.3_0.08_152)] text-white/85">
        <span aria-hidden="true" className="block h-3 pattern-zigzag" />
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-4 px-6 py-8 text-center sm:flex-row sm:text-left">
          <AyoAvatar className="size-14 bg-senegal-yellow ring-senegal-yellow" />
          <div className="flex-1">
            <p className="font-display text-lg font-bold text-white">Ayo Guide</p>
            <p className="text-sm font-semibold text-senegal-yellow">
              Ton guide des Jeux Olympiques de la Jeunesse · Dakar 2026
            </p>
            <p className="text-sm">
              Du 31 octobre au 13 novembre 2026, à Dakar, Diamniadio et Saly. Avec Ayo, le lion
              mascotte officielle.
            </p>
          </div>
          <Link
            to="/agenda"
            className={cn(
              buttonVariants(),
              'bg-senegal-yellow font-semibold text-[oklch(0.3_0.06_80)] hover:bg-senegal-yellow/90',
            )}
          >
            Le programme
          </Link>
        </div>
      </footer>
    </div>
  );
}

function NotFound() {
  return (
    <div className="flex flex-col items-center gap-4 py-12 text-center">
      <AyoAvatar className="size-28 animate-ayo-wave bg-senegal-yellow ring-4 ring-senegal-yellow/40" />
      <h1 className="text-3xl font-extrabold">Page introuvable</h1>
      <p className="text-muted-foreground">Ayo a cherché partout, mais cette page n’existe pas.</p>
      <Link to="/" className={buttonVariants({ size: 'lg' })}>
        Retour à l’accueil
      </Link>
    </div>
  );
}

export const Route = createRootRoute({ component: RootLayout, notFoundComponent: NotFound });
