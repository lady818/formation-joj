import { Injectable } from '@nestjs/common';
import { agendaDay, instantOf, sortByStart } from '../../domain/agenda';
import type { Animation } from '../../domain/animation';
import { AnimationRepository } from '../animation.repository';

export interface DayAgendaQuery {
  /** Le jour, `AAAA-MM-JJ`. */
  date: string;
  /** Facultatif : ne garder que les animations en cours à cette heure (`HH:MM`). */
  at?: string;
}

/** L'agenda d'un jour, trié par heure de début ; seulement ce qui est en cours si `at` est donné. */
@Injectable()
export class GetDayAgenda {
  constructor(private readonly animations: AnimationRepository) {}

  async execute({ date, at }: DayAgendaQuery): Promise<Animation[]> {
    const { from, to } = agendaDay(date);
    const instant = at === undefined ? null : instantOf(date, at);
    const agenda = sortByStart(await this.animations.listStartingBetween(from, to));
    return instant ? agenda.filter((animation) => animation.isInProgressAt(instant)) : agenda;
  }
}
