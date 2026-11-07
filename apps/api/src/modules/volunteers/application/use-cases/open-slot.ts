import { randomUUID } from 'node:crypto';
import { Injectable } from '@nestjs/common';
import type { OpenSlotInput } from '@joj/shared';
import { DisciplineRepository } from '../../../disciplines/application/discipline.repository';
import { disciplineNotFound } from '../../../disciplines/domain/disciplines.errors';
import { Slot } from '../../domain/slot';
import { SlotRepository } from '../slot.repository';

@Injectable()
export class OpenSlot {
  constructor(
    private readonly disciplines: DisciplineRepository,
    private readonly slots: SlotRepository,
  ) {}

  async execute(disciplineId: string, input: OpenSlotInput): Promise<Slot> {
    // Message clair dans le cas courant ; la clé étrangère couvre une discipline supprimée entre-temps.
    if (!(await this.disciplines.findById(disciplineId))) {
      throw disciplineNotFound(disciplineId);
    }
    const slot = Slot.create({
      id: randomUUID(),
      disciplineId,
      startsAt: new Date(input.startsAt),
      endsAt: new Date(input.endsAt),
      capacity: input.capacity,
      now: new Date(),
    });
    await this.slots.insert(slot);
    return slot;
  }
}
