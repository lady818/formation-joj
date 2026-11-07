import { useState } from 'react';
import { AYO_SRC } from '@/components/ayo';
import { PageHero } from '@/components/page-hero';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DEMO_DATE } from '@/lib/games';
import { useDayAgenda } from '../api/animations.queries';
import { AnimationList } from './animation-list';
import { DayPicker } from './day-picker';

/** Le jour (`AAAA-MM-JJ`) et l'heure (`HH:MM`) actuels à Dakar, qui est à UTC+0. */
function dakarNow(): { date: string; at: string } {
  const iso = new Date().toISOString();
  return { date: iso.slice(0, 10), at: iso.slice(11, 16) };
}

export function AgendaPage() {
  const [date, setDate] = useState(DEMO_DATE);
  const [at, setAt] = useState('');
  const agenda = useDayAgenda(date, at || undefined);
  const count = agenda.data?.length ?? 0;

  return (
    <div className="flex flex-col gap-6">
      <PageHero eyebrow="Le programme des Jeux" title="Agenda">
        <p className="-mt-4 max-w-md text-white/90">
          Qu’est-ce que je peux faire maintenant à Dakar ? Choisis un jour, et une heure pour ne
          garder que ce qui est en cours.
        </p>
        <div className="mt-5">
          <DayPicker value={date} onChange={setDate} />
        </div>
        <div className="mt-4 grid gap-3 rounded-2xl bg-white p-4 text-foreground shadow-lg sm:grid-cols-[1fr_1fr_auto] sm:items-end">
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
          <div className="flex gap-2">
            <Button
              type="button"
              className="rounded-full"
              onClick={() => {
                const now = dakarNow();
                setDate(now.date);
                setAt(now.at);
              }}
            >
              Maintenant
            </Button>
            <Button
              type="button"
              variant="outline"
              className="rounded-full"
              disabled={at === ''}
              onClick={() => setAt('')}
            >
              Tout afficher
            </Button>
          </div>
        </div>
      </PageHero>

      {agenda.isSuccess && count > 0 && (
        <p aria-live="polite" className="text-sm font-semibold text-muted-foreground">
          {count} animation{count > 1 ? 's' : ''}
          {at ? ` en cours à ${at}` : ' ce jour-là'}
        </p>
      )}
      {agenda.isLoading && (
        <p className="flex items-center gap-3 text-muted-foreground">
          <img
            src={AYO_SRC}
            alt=""
            className="size-10 animate-bounce rounded-full object-cover object-top"
          />
          Chargement…
        </p>
      )}
      {agenda.isError && (
        <p role="alert" className="rounded-xl bg-destructive/10 p-4 text-destructive">
          Impossible de charger l’agenda.
        </p>
      )}
      {agenda.isSuccess && (
        <AnimationList animations={agenda.data} inProgress={at !== ''} date={date} />
      )}
    </div>
  );
}
