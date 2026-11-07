import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useDayAgenda } from '../api/animations.queries';
import { AnimationList } from './animation-list';

/** Le jour affiché à l'ouverture : celui des animations de démo (`apps/api/data/animations.json`). */
const DEFAULT_DATE = '2026-11-01';

export function AgendaPage() {
  const [date, setDate] = useState(DEFAULT_DATE);
  const [at, setAt] = useState('');
  const agenda = useDayAgenda(date, at || undefined);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">Agenda</h1>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
        <div className="flex flex-col gap-2">
          <Label htmlFor="agenda-date">Jour</Label>
          <Input
            id="agenda-date"
            type="date"
            value={date}
            onChange={(event) => setDate(event.target.value)}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="agenda-at">En cours à</Label>
          <Input
            id="agenda-at"
            type="time"
            value={at}
            onChange={(event) => setAt(event.target.value)}
          />
        </div>
      </div>
      {agenda.isLoading && <p className="text-muted-foreground">Chargement…</p>}
      {agenda.isError && (
        <p role="alert" className="text-destructive">
          Impossible de charger l’agenda.
        </p>
      )}
      {agenda.isSuccess && <AnimationList animations={agenda.data} />}
    </div>
  );
}
