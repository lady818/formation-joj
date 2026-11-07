import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useDayAgenda } from '../api/animations.queries';
import { AnimationList } from './animation-list';

/** Le jour affiché à l'ouverture : celui des animations de démo (`apps/api/data/animations.json`). */
const DEFAULT_DATE = '2026-11-01';

/** Le jour (`AAAA-MM-JJ`) et l'heure (`HH:MM`) actuels à Dakar, qui est à UTC+0. */
function dakarNow(): { date: string; at: string } {
  const iso = new Date().toISOString();
  return { date: iso.slice(0, 10), at: iso.slice(11, 16) };
}

export function AgendaPage() {
  const [date, setDate] = useState(DEFAULT_DATE);
  const [at, setAt] = useState('');
  const agenda = useDayAgenda(date, at || undefined);

  return (
    <div className="flex flex-col gap-6">
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-senegal-green via-[oklch(0.62_0.15_130)] to-sunset p-6 text-white shadow-lg duration-700 animate-in fade-in slide-in-from-top-4">
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -top-6 -right-4 text-8xl opacity-25 select-none"
        >
          🦁
        </span>
        <h1 className="text-3xl font-extrabold tracking-tight">Agenda</h1>
        <p className="mt-1 max-w-md text-white/90">
          Qu’est-ce que je peux faire maintenant à Dakar ? Choisis un jour, et une heure pour ne
          garder que ce qui est en cours.
        </p>
        <div className="mt-5 grid gap-3 rounded-xl bg-white/95 p-4 text-foreground shadow-md sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="agenda-date">Jour</Label>
            <Input
              id="agenda-date"
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="agenda-at">En cours à</Label>
            <Input
              id="agenda-at"
              type="time"
              value={at}
              onChange={(event) => setAt(event.target.value)}
            />
          </div>
          <div className="flex flex-wrap gap-2 sm:col-span-2">
            <Button
              type="button"
              onClick={() => {
                const now = dakarNow();
                setDate(now.date);
                setAt(now.at);
              }}
            >
              Maintenant
            </Button>
            <Button type="button" variant="outline" disabled={at === ''} onClick={() => setAt('')}>
              Tout afficher
            </Button>
          </div>
        </div>
      </section>
      {agenda.isLoading && <p className="animate-pulse text-muted-foreground">Chargement…</p>}
      {agenda.isError && (
        <p role="alert" className="rounded-lg bg-destructive/10 p-3 text-destructive">
          Impossible de charger l’agenda.
        </p>
      )}
      {agenda.isSuccess && <AnimationList animations={agenda.data} inProgress={at !== ''} />}
    </div>
  );
}
