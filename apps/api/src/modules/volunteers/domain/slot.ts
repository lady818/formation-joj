import { SLOT_MIN_CAPACITY } from '@joj/shared';
import { type NewRegistration, Registration } from './registration';
import { VolunteerError } from './volunteers.errors';

export interface SlotProps {
  id: string;
  disciplineId: string;
  startsAt: Date;
  endsAt: Date;
  capacity: number;
  registeredCount: number;
  createdAt: Date;
}

export interface NewSlot {
  id: string;
  disciplineId: string;
  startsAt: Date;
  endsAt: Date;
  capacity: number;
  now: Date;
}

/** Un créneau d'accueil d'une discipline : une plage horaire et une capacité d'au moins 1. */
export class Slot {
  private constructor(private props: SlotProps) {}

  static create({ id, disciplineId, startsAt, endsAt, capacity, now }: NewSlot): Slot {
    if (!Number.isInteger(capacity) || capacity < SLOT_MIN_CAPACITY) {
      throw new VolunteerError(
        'SLOT_CAPACITY_INVALID',
        `A slot capacity is an integer of at least ${SLOT_MIN_CAPACITY}`,
        { capacity },
      );
    }
    if (endsAt.getTime() <= startsAt.getTime()) {
      throw new VolunteerError('SLOT_ENDS_BEFORE_START', 'A slot must end after it starts', {
        startsAt: startsAt.toISOString(),
        endsAt: endsAt.toISOString(),
      });
    }
    return new Slot({
      id,
      disciplineId,
      startsAt,
      endsAt,
      capacity,
      registeredCount: 0,
      createdAt: now,
    });
  }

  /** Reconstruit un créneau depuis la persistance, sans rejouer les règles de création. */
  static restore(props: SlotProps): Slot {
    return new Slot({ ...props });
  }

  get id(): string {
    return this.props.id;
  }

  get disciplineId(): string {
    return this.props.disciplineId;
  }

  get startsAt(): Date {
    return this.props.startsAt;
  }

  get endsAt(): Date {
    return this.props.endsAt;
  }

  get capacity(): number {
    return this.props.capacity;
  }

  get registeredCount(): number {
    return this.props.registeredCount;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  /** Inscrit un bénévole ; refuse avec SLOT_FULL quand la capacité est atteinte. */
  register(volunteer: Omit<NewRegistration, 'slotId'>): Registration {
    if (this.props.registeredCount >= this.props.capacity) {
      throw new VolunteerError('SLOT_FULL', 'This slot is full', {
        slotId: this.props.id,
        capacity: this.props.capacity,
      });
    }
    const registration = Registration.create({ ...volunteer, slotId: this.props.id });
    this.props = { ...this.props, registeredCount: this.props.registeredCount + 1 };
    return registration;
  }
}
