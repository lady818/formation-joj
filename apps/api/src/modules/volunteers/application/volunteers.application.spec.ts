import { describe, expect, it, vi } from 'vitest';
import { Discipline } from '../../disciplines/domain/discipline';
import { InMemoryDisciplineRepository } from '../../disciplines/application/testing/in-memory-discipline.repository';
import { InMemorySlotRepository } from './testing/in-memory-slot.repository';
import { OpenSlot } from './use-cases/open-slot';
import { RegisterVolunteer } from './use-cases/register-volunteer';

const LUTTE_ID = '0199f5c2-0000-7000-8000-000000000001';
const UNKNOWN_ID = '0199f5c2-0000-7000-8000-00000000ffff';
const NINE = '2026-11-01T09:00:00.000+01:00';
const NOON = '2026-11-01T12:00:00.000+01:00';

async function setup() {
  const disciplines = new InMemoryDisciplineRepository();
  await disciplines.insert(
    Discipline.create({
      id: LUTTE_ID,
      name: 'Lutte',
      category: 'sports-de-combat',
      now: new Date(),
    }),
  );
  const slots = new InMemorySlotRepository();
  return {
    slots,
    openSlot: new OpenSlot(disciplines, slots),
    registerVolunteer: new RegisterVolunteer(slots),
  };
}

describe('volunteers (application layer)', () => {
  it('001-AS1: opens a slot for an existing discipline and stores it', async () => {
    const { slots, openSlot } = await setup();
    const slot = await openSlot.execute(LUTTE_ID, { startsAt: NINE, endsAt: NOON, capacity: 2 });

    expect(slot.id).toMatch(/^[0-9a-f-]{36}$/);
    expect(await slots.findById(slot.id)).toMatchObject({
      disciplineId: LUTTE_ID,
      startsAt: new Date(NINE),
      endsAt: new Date(NOON),
      capacity: 2,
      registeredCount: 0,
    });
  });

  it.each([
    [{ startsAt: NINE, endsAt: NOON, capacity: 0 }, 'SLOT_CAPACITY_INVALID'],
    [{ startsAt: NOON, endsAt: NINE, capacity: 2 }, 'SLOT_ENDS_BEFORE_START'],
  ])('001-AS2: refuses an invalid slot and stores nothing (%j)', async (input, code) => {
    const { slots, openSlot } = await setup();
    const insert = vi.spyOn(slots, 'insert');

    await expect(openSlot.execute(LUTTE_ID, input)).rejects.toMatchObject({
      code,
      kind: 'VALIDATION',
    });
    expect(insert).not.toHaveBeenCalled();
  });

  it('001-AS3: refuses a slot for an unknown discipline', async () => {
    const { slots, openSlot } = await setup();
    const insert = vi.spyOn(slots, 'insert');

    await expect(
      openSlot.execute(UNKNOWN_ID, { startsAt: NINE, endsAt: NOON, capacity: 2 }),
    ).rejects.toMatchObject({ code: 'DISCIPLINE_NOT_FOUND', kind: 'NOT_FOUND' });
    expect(insert).not.toHaveBeenCalled();
  });

  it('001-AS4: registers Awa Diop and the slot counts one registration', async () => {
    const { slots, openSlot, registerVolunteer } = await setup();
    const slot = await openSlot.execute(LUTTE_ID, { startsAt: NINE, endsAt: NOON, capacity: 2 });

    const registration = await registerVolunteer.execute(slot.id, {
      name: 'Awa Diop',
      email: 'awa@example.org',
    });

    expect(registration).toMatchObject({
      slotId: slot.id,
      name: 'Awa Diop',
      email: 'awa@example.org',
    });
    expect((await slots.findById(slot.id))?.registeredCount).toBe(1);
  });

  it('001-AS6: refuses a third registration on a slot of capacity 2', async () => {
    const { slots, openSlot, registerVolunteer } = await setup();
    const slot = await openSlot.execute(LUTTE_ID, { startsAt: NINE, endsAt: NOON, capacity: 2 });
    await registerVolunteer.execute(slot.id, { name: 'Awa Diop', email: 'awa@example.org' });
    await registerVolunteer.execute(slot.id, { name: 'Moussa Fall', email: 'moussa@example.org' });

    await expect(
      registerVolunteer.execute(slot.id, { name: 'Fatou Sow', email: 'fatou@example.org' }),
    ).rejects.toMatchObject({ code: 'SLOT_FULL', kind: 'CONFLICT' });
    expect((await slots.findById(slot.id))?.registeredCount).toBe(2);
  });

  it('001-AS7: refuses an unknown slot', async () => {
    const { registerVolunteer } = await setup();
    await expect(
      registerVolunteer.execute(UNKNOWN_ID, { name: 'Awa Diop', email: 'awa@example.org' }),
    ).rejects.toMatchObject({ code: 'SLOT_NOT_FOUND', kind: 'NOT_FOUND' });
  });
});
