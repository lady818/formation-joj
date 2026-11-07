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
});
