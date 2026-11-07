import { Inject, Injectable } from '@nestjs/common';
import { count, eq } from 'drizzle-orm';
import type { Database } from '../../../core/database/database';
import { DATABASE } from '../../../core/database/database.module';
import { SlotRepository } from '../application/slot.repository';
import type { Registration } from '../domain/registration';
import type { Slot } from '../domain/slot';
import { registrationToDomain, registrationToRow, toDomain, toRow } from './slot.mapper';
import { registrations, slots } from './volunteers.schema';

@Injectable()
export class DrizzleSlotRepository extends SlotRepository {
  constructor(@Inject(DATABASE) private readonly db: Database) {
    super();
  }

  async insert(slot: Slot): Promise<void> {
    await this.db.insert(slots).values(toRow(slot));
  }

  async findById(id: string): Promise<Slot | null> {
    const [row] = await this.db.select().from(slots).where(eq(slots.id, id)).limit(1);
    if (!row) return null;
    return toDomain(row, await countRegistrations(this.db, id));
  }

  /**
   * La capacité ne s'exprime pas par une contrainte de table : le verrou FOR UPDATE sur la ligne
   * du créneau, tenu jusqu'à la fin de la transaction, fait passer les inscriptions d'un même
   * créneau l'une après l'autre (001-AS6).
   */
  async registerInSlot(
    slotId: string,
    register: (slot: Slot) => Registration,
  ): Promise<Registration | null> {
    return this.db.transaction(async (tx) => {
      const [row] = await tx.select().from(slots).where(eq(slots.id, slotId)).for('update');
      if (!row) return null;
      const registration = register(toDomain(row, await countRegistrations(tx, slotId)));
      const [inserted] = await tx
        .insert(registrations)
        .values(registrationToRow(registration))
        .returning();
      return inserted ? registrationToDomain(inserted) : registration;
    });
  }
}

async function countRegistrations(db: Pick<Database, 'select'>, slotId: string): Promise<number> {
  const [result] = await db
    .select({ value: count() })
    .from(registrations)
    .where(eq(registrations.slotId, slotId));
  return result?.value ?? 0;
}
