import { Registration } from '../../domain/registration';
import { Slot } from '../../domain/slot';
import { SlotRepository } from '../slot.repository';

/**
 * Fake fidèle au contrat du port : le nombre d'inscrits est compté sur les inscriptions
 * enregistrées, et les inscriptions sur un même créneau passent l'une après l'autre.
 */
export class InMemorySlotRepository extends SlotRepository {
  private readonly slots = new Map<string, Slot>();
  private readonly registrations: Registration[] = [];
  private queue: Promise<unknown> = Promise.resolve();

  async insert(slot: Slot): Promise<void> {
    this.slots.set(slot.id, cloneSlot(slot, 0));
  }

  async findById(id: string): Promise<Slot | null> {
    const found = this.slots.get(id);
    return found ? cloneSlot(found, this.countFor(id)) : null;
  }

  registerInSlot(
    slotId: string,
    register: (slot: Slot) => Registration,
  ): Promise<Registration | null> {
    // Comme le verrou FOR UPDATE : une inscription attend la fin de la précédente.
    const next = this.queue.then(async () => {
      const slot = await this.findById(slotId);
      if (!slot) return null;
      const registration = register(slot);
      this.registrations.push(cloneRegistration(registration));
      return cloneRegistration(registration);
    });
    this.queue = next.catch(() => undefined);
    return next;
  }

  private countFor(slotId: string): number {
    return this.registrations.filter((registration) => registration.slotId === slotId).length;
  }
}

/** Copie : un test ne voit pas une modification qui n'a pas été persistée. */
function cloneSlot(slot: Slot, registeredCount: number): Slot {
  return Slot.restore({
    id: slot.id,
    disciplineId: slot.disciplineId,
    startsAt: slot.startsAt,
    endsAt: slot.endsAt,
    capacity: slot.capacity,
    registeredCount,
    createdAt: slot.createdAt,
  });
}

function cloneRegistration(registration: Registration): Registration {
  return Registration.restore({
    id: registration.id,
    slotId: registration.slotId,
    name: registration.name,
    email: registration.email,
    createdAt: registration.createdAt,
  });
}
