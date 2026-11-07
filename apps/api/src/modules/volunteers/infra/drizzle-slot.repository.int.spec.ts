import { randomUUID } from 'node:crypto';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { type DatabaseConnection, openDatabase } from '../../../core/database/database';
import { DrizzleDisciplineRepository } from '../../disciplines/infra/drizzle-discipline.repository';
import { Discipline } from '../../disciplines/domain/discipline';
import { Slot } from '../domain/slot';
import { DrizzleSlotRepository } from './drizzle-slot.repository';

const volunteer = (name: string) => ({
  id: randomUUID(),
  name,
  email: `${name.toLowerCase().replace(/\s+/g, '.')}@example.org`,
  now: new Date('2026-10-31T10:00:00.456Z'),
});

describe('DrizzleSlotRepository (in-memory PGlite, migrations applied)', () => {
  let connection: DatabaseConnection;
  let repository: DrizzleSlotRepository;
  let disciplineId: string;

  beforeAll(async () => {
    connection = openDatabase({ pgliteDataDir: 'memory://' });
    await connection.migrate();
    repository = new DrizzleSlotRepository(connection.db);
    const lutte = Discipline.create({
      id: randomUUID(),
      name: 'Lutte',
      category: 'sports-de-combat',
      now: new Date(),
    });
    await new DrizzleDisciplineRepository(connection.db).insert(lutte);
    disciplineId = lutte.id;
  });

  afterAll(() => connection?.close());

  const openSlot = async (capacity = 2) => {
    const slot = Slot.create({
      id: randomUUID(),
      disciplineId,
      startsAt: new Date('2026-11-01T08:00:00.000Z'),
      endsAt: new Date('2026-11-01T11:00:00.000Z'),
      capacity,
      now: new Date('2026-10-31T09:00:00.123Z'),
    });
    await repository.insert(slot);
    return slot;
  };

  it('001-AS1: reads back exactly the slot it wrote, with no registration', async () => {
    const slot = await openSlot();
    expect(await repository.findById(slot.id)).toEqual(slot);
    expect(await repository.findById(randomUUID())).toBeNull();
  });

  it('001-AS4: registers a volunteer and counts one when the slot is read again', async () => {
    const slot = await openSlot();
    const registration = await repository.registerInSlot(slot.id, (locked) =>
      locked.register(volunteer('Awa Diop')),
    );

    expect(registration).toMatchObject({
      slotId: slot.id,
      name: 'Awa Diop',
      email: 'awa.diop@example.org',
    });
    expect((await repository.findById(slot.id))?.registeredCount).toBe(1);
  });

  it('001-AS6: never registers more volunteers than the capacity, even concurrently', async () => {
    const slot = await openSlot(2);
    const results = await Promise.allSettled(
      ['Awa Diop', 'Moussa Fall', 'Fatou Sow'].map((name) =>
        repository.registerInSlot(slot.id, (locked) => locked.register(volunteer(name))),
      ),
    );

    expect(results.filter((result) => result.status === 'fulfilled')).toHaveLength(2);
    const rejected = results.filter((result) => result.status === 'rejected');
    expect(rejected).toHaveLength(1);
    expect(rejected[0]?.reason).toMatchObject({ code: 'SLOT_FULL', kind: 'CONFLICT' });
    expect((await repository.findById(slot.id))?.registeredCount).toBe(2);
  });

  it('001-AS7: returns null for an unknown slot and stores nothing', async () => {
    expect(
      await repository.registerInSlot(randomUUID(), (locked) =>
        locked.register(volunteer('Awa Diop')),
      ),
    ).toBeNull();
  });
});
