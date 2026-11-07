import type { DisciplineResponse } from '@joj/shared';
import { Link } from '@tanstack/react-router';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useDeleteDiscipline } from '../api/disciplines.queries';
import { CATEGORY_LABELS, CATEGORY_TONES } from './category-labels';
import { DeleteDisciplineButton } from './delete-discipline-button';
import { DisciplineEditForm } from './discipline-edit-form';
import { errorMessage } from './error-message';

export function DisciplineList({ disciplines }: { disciplines: DisciplineResponse[] }) {
  const [editingId, setEditingId] = useState<string | null>(null);
  // Au niveau de la liste : le message reste visible si la ligne disparaît après la relecture.
  const deleteDiscipline = useDeleteDiscipline();

  return (
    <div className="flex flex-col gap-2">
      {deleteDiscipline.error && (
        <p role="alert" className="text-sm text-destructive">
          {errorMessage(deleteDiscipline.error)}
        </p>
      )}
      {disciplines.length === 0 ? (
        <p className="rounded-2xl border border-dashed bg-card p-8 text-center text-muted-foreground">
          Aucune discipline pour l’instant.
        </p>
      ) : (
        <ul aria-label="Disciplines" className="grid gap-3">
          {disciplines.map((discipline, index) => (
            <li
              key={discipline.id}
              aria-label={discipline.name}
              style={{ animationDelay: `${index * 60}ms` }}
              className="rounded-2xl border bg-card px-4 py-3 shadow-sm transition duration-500 animate-in fill-mode-both fade-in slide-in-from-bottom-2 hover:border-primary/30 hover:shadow-md"
            >
              {editingId === discipline.id ? (
                <DisciplineEditForm discipline={discipline} onDone={() => setEditingId(null)} />
              ) : (
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <span
                      aria-hidden="true"
                      className={`grid size-10 shrink-0 place-items-center rounded-xl font-display text-lg font-extrabold ${CATEGORY_TONES[discipline.category]}`}
                    >
                      {discipline.name.charAt(0).toUpperCase()}
                    </span>
                    <Link
                      to="/disciplines/$disciplineId"
                      params={{ disciplineId: discipline.id }}
                      className="font-display text-lg font-bold underline-offset-4 hover:text-primary hover:underline"
                    >
                      {discipline.name}
                    </Link>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-semibold text-muted-foreground">
                      {CATEGORY_LABELS[discipline.category]}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      aria-label={`Modifier ${discipline.name}`}
                      onClick={() => setEditingId(discipline.id)}
                    >
                      Modifier
                    </Button>
                    <DeleteDisciplineButton
                      discipline={discipline}
                      disabled={deleteDiscipline.isPending}
                      onConfirm={() => deleteDiscipline.mutate(discipline.id)}
                    />
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
