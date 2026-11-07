import type { AnimationResponse } from '@joj/shared';

/** Dakar est à UTC+0 : les heures s'affichent dans le fuseau de Dakar, quel que soit l'appareil. */
const timeFormat = new Intl.DateTimeFormat('fr-FR', {
  hour: '2-digit',
  minute: '2-digit',
  timeZone: 'Africa/Dakar',
});

const time = (iso: string) => timeFormat.format(new Date(iso));

export function AnimationList({ animations }: { animations: AnimationResponse[] }) {
  if (animations.length === 0) {
    return <p className="text-muted-foreground">Aucune animation.</p>;
  }
  return (
    <ul aria-label="Animations" className="divide-y rounded-md border">
      {animations.map((animation) => (
        <li key={animation.id} aria-label={animation.title} className="flex flex-col px-4 py-3">
          <span className="font-medium">{animation.title}</span>
          <span className="text-sm text-muted-foreground">
            {time(animation.startsAt)} – {time(animation.endsAt)} · {animation.place}
          </span>
        </li>
      ))}
    </ul>
  );
}
