import { createRootRoute, Link, Outlet } from '@tanstack/react-router';
import { buttonVariants } from '@/components/ui/button';

function RootLayout() {
  return (
    <div className="mx-auto flex min-h-screen max-w-3xl flex-col gap-6 p-6">
      {/* Bandeau aux couleurs du Sénégal : vert, jaune, rouge. */}
      <div aria-hidden="true" className="fixed inset-x-0 top-0 flex h-1.5">
        <span className="flex-1 bg-senegal-green" />
        <span className="flex-1 bg-senegal-yellow" />
        <span className="flex-1 bg-senegal-red" />
      </div>
      <header className="flex items-center justify-between gap-4 pt-2">
        <Link to="/" className="flex items-center gap-2 text-lg font-bold tracking-tight">
          <span
            aria-hidden="true"
            className="grid size-9 place-items-center rounded-full bg-senegal-yellow text-xl shadow-sm"
          >
            🦁
          </span>
          <span>
            JOJ <span className="text-primary">Dakar</span> 2026
          </span>
        </Link>
        <nav className="flex gap-2">
          <Link
            to="/agenda"
            className={buttonVariants({ variant: 'ghost' })}
            activeProps={{ className: 'underline' }}
          >
            Agenda
          </Link>
          <Link
            to="/disciplines"
            className={buttonVariants({ variant: 'ghost' })}
            activeProps={{ className: 'underline' }}
          >
            Disciplines
          </Link>
        </nav>
      </header>
      <main className="flex flex-col gap-6">
        <Outlet />
      </main>
    </div>
  );
}

function NotFound() {
  return (
    <div className="flex flex-col items-start gap-4">
      <h1 className="text-2xl font-semibold">Page introuvable</h1>
      <Link to="/" className={buttonVariants()}>
        Retour à l’accueil
      </Link>
    </div>
  );
}

export const Route = createRootRoute({ component: RootLayout, notFoundComponent: NotFound });
