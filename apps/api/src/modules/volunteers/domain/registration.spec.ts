import { describe, expect, it } from 'vitest';
import { Registration } from './registration';
import { VolunteerError } from './volunteers.errors';

const NOW = new Date('2026-10-31T09:00:00.000Z');
const ID = '0199f5c2-0000-7000-8000-000000000201';
const SLOT_ID = '0199f5c2-0000-7000-8000-000000000101';

const register = (name: string, email: string) =>
  Registration.create({ id: ID, slotId: SLOT_ID, name, email, now: NOW });

describe('Registration', () => {
  it('001-AS4: registers a volunteer with a trimmed name and an email', () => {
    expect(register('  Awa Diop ', 'awa@example.org')).toMatchObject({
      id: ID,
      slotId: SLOT_ID,
      name: 'Awa Diop',
      email: 'awa@example.org',
      createdAt: NOW,
    });
  });

  it.each(['', '   '])('001-AS5: rejects an empty name or a malformed email (name %j)', (name) => {
    expect(() => register(name, 'awa@example.org')).toThrow(VolunteerError);
    expect(() => register(name, 'awa@example.org')).toThrow(
      expect.objectContaining({ code: 'REGISTRATION_NAME_REQUIRED', kind: 'VALIDATION' }),
    );
  });

  it('001-AS5: rejects an empty name or a malformed email (name too long)', () => {
    expect(() => register('x'.repeat(101), 'awa@example.org')).toThrow(
      expect.objectContaining({ code: 'REGISTRATION_NAME_TOO_LONG', kind: 'VALIDATION' }),
    );
  });

  it.each(['', 'awa', 'awa@', '@example.org', 'awa diop@example.org', `${'a'.repeat(250)}@x.org`])(
    '001-AS5: rejects an empty name or a malformed email (email %j)',
    (email) => {
      expect(() => register('Awa Diop', email)).toThrow(
        expect.objectContaining({ code: 'REGISTRATION_EMAIL_INVALID', kind: 'VALIDATION' }),
      );
    },
  );
});
