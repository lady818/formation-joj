import { DISCIPLINE_CATEGORIES, type DisciplineCategory } from '@joj/shared';
import { useState } from 'react';
import { PageHero } from '@/components/page-hero';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { useDisciplines } from '../api/disciplines.queries';
import { CATEGORY_LABELS } from './category-labels';
import { DisciplineForm } from './discipline-form';
import { DisciplineList } from './discipline-list';

/** Compare sans tenir compte des majuscules ni des accents : « lutte » trouve « Lutte ». */
const normalize = (text: string) =>
  text
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase();

export function DisciplinesPage() {
  const disciplines = useDisciplines();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<DisciplineCategory | null>(null);

  const all = disciplines.data ?? [];
  const shown = all.filter(
    (discipline) =>
      (category === null || discipline.category === category) &&
      normalize(discipline.name).includes(normalize(search.trim())),
  );
  const filtering = search.trim() !== '' || category !== null;

  return (
    <div className="flex flex-col gap-6">
      <PageHero eyebrow="Les épreuves des Jeux" title="Disciplines">
        <p className="-mt-4 max-w-md text-white/90">
          {disciplines.isSuccess
            ? `${all.length} discipline${all.length > 1 ? 's' : ''} au programme de Dakar 2026.`
            : 'Toutes les épreuves au programme de Dakar 2026.'}
        </p>
      </PageHero>

      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle className="font-display text-lg">Nouvelle discipline</CardTitle>
        </CardHeader>
        <CardContent>
          <DisciplineForm />
        </CardContent>
      </Card>

      {disciplines.isSuccess && all.length > 0 && (
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="discipline-search">Rechercher une discipline</Label>
            <Input
              id="discipline-search"
              type="search"
              placeholder="Lutte, natation…"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="h-11 rounded-full bg-card px-4"
            />
          </div>
          <div role="group" aria-label="Filtrer par catégorie" className="flex flex-wrap gap-2">
            {[null, ...DISCIPLINE_CATEGORIES].map((value) => (
              <button
                key={value ?? 'all'}
                type="button"
                aria-pressed={category === value}
                onClick={() => setCategory(value)}
                className={cn(
                  'rounded-full border px-3 py-1.5 text-sm font-semibold transition',
                  category === value
                    ? 'border-primary bg-primary text-primary-foreground shadow-sm'
                    : 'bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground',
                )}
              >
                {value === null ? 'Toutes' : CATEGORY_LABELS[value]}
              </button>
            ))}
          </div>
        </div>
      )}

      {disciplines.isPending && <p className="text-muted-foreground">Chargement…</p>}
      {disciplines.isError && (
        <p role="alert" className="rounded-xl bg-destructive/10 p-4 text-destructive">
          Impossible de charger les disciplines.
        </p>
      )}
      {disciplines.isSuccess &&
        (filtering && shown.length === 0 ? (
          <p className="rounded-2xl border border-dashed bg-card p-8 text-center text-muted-foreground">
            Aucune discipline ne correspond à ta recherche.
          </p>
        ) : (
          <DisciplineList disciplines={shown} />
        ))}
    </div>
  );
}
