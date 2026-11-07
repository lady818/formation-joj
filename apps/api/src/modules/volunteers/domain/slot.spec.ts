import { describe, expect, it } from 'vitest';
import { Slot } from './slot';
import { VolunteerError } from './volunteers.errors';

const NOW = new Date('2026-10-31T09:00:00.000Z');
const SLOT_ID = '0199f5c2-0000-7000-8000-000000000101';
const LUTTE_ID = '0199f5c2-0000-7000-8000-000000000001';
const NINE = new Date('2026-11-01T09:00:00.000+01:00');
const NOON = new Date('2026-11-01T12:00:00.000+01:00');

const open = (overrides: Partial<{ startsAt: Date; endsAt: Date; capacity: number }> = {}) =>
  Slot.create({
    id: SLOT_ID,
    disciplineId: LUTTE_ID,
    startsAt: NINE,
    endsAt: NOON,
    capacity: 2,
    now: NOW,
    ...overrides,
  });

describe('Slot', () => {
  it('001-AS1: opens a slot with no registration', () => {
    expect(open()).toMatchObject({
      id: SLOT_ID,
      disciplineId: LUTTE_ID,
      startsAt: NINE,
      endsAt: NOON,
      capacity: 2,
      registeredCount: 0,
      createdAt: NOW,
    });
  });

  it.each([0, -1, 1.5])(
    '001-AS2: rejects an invalid capacity or time range (capacity %j)',
    (capacity) => {
      expect(() => open({ capacity })).toThrow(VolunteerError);
      expect(() => open({ capacity })).toThrow(
        expect.objectContaining({ code: 'SLOT_CAPACITY_INVALID', kind: 'VALIDATION' }),
      );
    },
  );

  it.each([
    [NINE, NINE],
    [NOON, NINE],
  ])('001-AS2: rejects an invalid capacity or time range (from %s to %s)', (startsAt, endsAt) => {
    expect(() => open({ startsAt, endsAt })).toThrow(
      expect.objectContaining({ code: 'SLOT_ENDS_BEFORE_START', kind: 'VALIDATION' }),
    );
  });

  const volunteer = (n: number) => ({
    id: `0199f5c2-0000-7000-8000-00000000020${n}`,
    name: `Bénévole ${n}`,
    email: `benevole${n}@example.org`,
    now: NOW,
  });

  it('001-AS4: registers a volunteer and counts one', () => {
    const slot = open();
    const registration = slot.register({
      id: '0199f5c2-0000-7000-8000-000000000201',
      name: 'Awa Diop',
      email: 'awa@example.org',
      now: NOW,
    });
    expect(registration).toMatchObject({
      id: '0199f5c2-0000-7000-8000-000000000201',
      slotId: SLOT_ID,
      name: 'Awa Diop',
      email: 'awa@example.org',
      createdAt: NOW,
    });
    expect(slot.registeredCount).toBe(1);
  });

  it('001-AS6: refuses a full slot', () => {
    const slot = open({ capacity: 2 });
    slot.register(volunteer(1));
    slot.register(volunteer(2));
    expect(() => slot.register(volunteer(3))).toThrow(VolunteerError);
    expect(() => slot.register(volunteer(3))).toThrow(
      expect.objectContaining({ code: 'SLOT_FULL', kind: 'CONFLICT' }),
    );
    expect(slot.registeredCount).toBe(2);
  });

  it('001-AS5: does not count a refused registration', () => {
    const slot = open();
    expect(() => slot.register({ ...volunteer(1), name: ' ' })).toThrow(
      expect.objectContaining({ code: 'REGISTRATION_NAME_REQUIRED' }),
    );
    expect(slot.registeredCount).toBe(0);
  });
});
