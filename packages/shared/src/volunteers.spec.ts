import { describe, expect, it } from 'vitest';
import { openSlotSchema, registerVolunteerSchema } from './volunteers.ts';

const START = '2026-11-01T09:00:00.000+01:00';
const END = '2026-11-01T12:00:00.000+01:00';

const issuePaths = (result: { success: boolean; error?: { issues: { path: PropertyKey[] }[] } }) =>
  result.error?.issues.map((issue) => issue.path.join('.')) ?? [];

describe('openSlotSchema', () => {
  it('001-AS1: accepts a start, a later end and a capacity of 2', () => {
    expect(openSlotSchema.parse({ startsAt: START, endsAt: END, capacity: 2 })).toEqual({
      startsAt: START,
      endsAt: END,
      capacity: 2,
    });
  });

  it.each([
    [{ startsAt: START, endsAt: END, capacity: 0 }, 'capacity'],
    [{ startsAt: START, endsAt: END, capacity: 1.5 }, 'capacity'],
    [{ startsAt: START, endsAt: START, capacity: 2 }, 'endsAt'],
    [{ startsAt: END, endsAt: START, capacity: 2 }, 'endsAt'],
  ])('001-AS2: rejects a capacity below 1 or an end before the start (%j)', (body, field) => {
    const result = openSlotSchema.safeParse(body);
    expect(result.success).toBe(false);
    expect(issuePaths(result)).toContain(field);
  });
});

describe('registerVolunteerSchema', () => {
  it('001-AS4: accepts a name and an email, and trims the name', () => {
    expect(
      registerVolunteerSchema.parse({ name: '  Awa Diop ', email: 'awa@example.org' }),
    ).toEqual({ name: 'Awa Diop', email: 'awa@example.org' });
  });

  it.each([
    [{ name: '', email: 'awa@example.org' }, 'name'],
    [{ name: '   ', email: 'awa@example.org' }, 'name'],
    [{ name: 'Awa Diop', email: 'awa-at-example' }, 'email'],
  ])('001-AS5: rejects an empty name or a malformed email (%j)', (body, field) => {
    const result = registerVolunteerSchema.safeParse(body);
    expect(result.success).toBe(false);
    expect(issuePaths(result)).toContain(field);
  });
});
