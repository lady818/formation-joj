import { useEffect, useRef } from 'react';
import { dayLabel, gamesDays } from '@/lib/games';
import { cn } from '@/lib/utils';

const DAYS = gamesDays();

/** Une puce par jour des Jeux : un clic choisit le jour, la puce choisie reste visible. */
export function DayPicker({ value, onChange }: { value: string; onChange: (day: string) => void }) {
  const selected = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    selected.current?.scrollIntoView?.({ block: 'nearest', inline: 'center', behavior: 'smooth' });
  }, [value]);
  return (
    <div
      role="group"
      aria-label="Jours des Jeux"
      className="-mx-1 flex snap-x gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none]"
    >
      {DAYS.map((day, index) => {
        const label = dayLabel(day);
        const active = day === value;
        return (
          <button
            key={day}
            ref={active ? selected : undefined}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(day)}
            className={cn(
              'flex min-w-16 shrink-0 snap-center flex-col items-center rounded-2xl px-3 py-2 text-xs font-semibold ring-1 transition',
              active
                ? 'scale-105 bg-senegal-yellow text-[oklch(0.25_0.06_80)] shadow-lg ring-senegal-yellow'
                : 'bg-white/10 text-white ring-white/25 hover:bg-white/20',
            )}
          >
            <span className="opacity-80">J{index + 1}</span>
            <span className="font-display text-sm font-bold capitalize">{label.day}</span>
            <span className="opacity-80">{label.month}</span>
          </button>
        );
      })}
    </div>
  );
}
