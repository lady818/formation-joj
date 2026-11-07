import { randomUUID } from 'node:crypto';
import { Injectable } from '@nestjs/common';
import type { RegisterVolunteerInput } from '@joj/shared';
import type { Registration } from '../../domain/registration';
import { slotNotFound } from '../../domain/volunteers.errors';
import { SlotRepository } from '../slot.repository';

@Injectable()
export class RegisterVolunteer {
  constructor(private readonly slots: SlotRepository) {}

  async execute(slotId: string, input: RegisterVolunteerInput): Promise<Registration> {
    const registration = await this.slots.registerInSlot(slotId, (slot) =>
      slot.register({ id: randomUUID(), name: input.name, email: input.email, now: new Date() }),
    );
    if (!registration) throw slotNotFound(slotId);
    return registration;
  }
}
