import type { INestApplication } from '@nestjs/common';
import { disciplineSchema, registrationSchema, slotSchema } from '@joj/shared';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createTestApp } from './create-test-app';

const UNKNOWN_ID = '0199f5c2-0000-7000-8000-00000000ffff';
const NINE = '2026-11-01T09:00:00.000+01:00';
const NOON = '2026-11-01T12:00:00.000+01:00';

describe('/api/…/slots and /api/slots/:slotId/registrations (e2e)', () => {
  let app: INestApplication;
  let lutteId: string;
  const api = () => request(app.getHttpServer());

  beforeAll(async () => {
    app = await createTestApp();
    const response = await api()
      .post('/api/disciplines')
      .send({ name: 'Lutte', category: 'sports-de-combat' })
      .expect(201);
    lutteId = disciplineSchema.parse(response.body).id;
  });

  afterAll(() => app?.close());

  const openSlot = async (capacity = 2) => {
    const response = await api()
      .post(`/api/disciplines/${lutteId}/slots`)
      .send({ startsAt: NINE, endsAt: NOON, capacity })
      .expect(201);
    return slotSchema.parse(response.body);
  };

  const register = (slotId: string, name: string, email: string) =>
    api().post(`/api/slots/${slotId}/registrations`).send({ name, email });

  it('001-AS1: opens a slot (201) with no registration', async () => {
    const response = await api()
      .post(`/api/disciplines/${lutteId}/slots`)
      .send({ startsAt: NINE, endsAt: NOON, capacity: 2 })
      .expect(201);

    expect(slotSchema.parse(response.body)).toEqual({
      id: expect.any(String),
      disciplineId: lutteId,
      startsAt: new Date(NINE).toISOString(),
      endsAt: new Date(NOON).toISOString(),
      capacity: 2,
      registeredCount: 0,
    });
  });

  it.each([
    [{ startsAt: NINE, endsAt: NOON, capacity: 0 }, 'capacity'],
    [{ startsAt: NOON, endsAt: NINE, capacity: 2 }, 'endsAt'],
  ])('001-AS2: rejects an invalid slot (400, VALIDATION_FAILED) %j', async (body, field) => {
    const response = await api().post(`/api/disciplines/${lutteId}/slots`).send(body).expect(400);

    expect(response.headers['content-type']).toMatch(/application\/problem\+json/);
    expect(response.body).toMatchObject({ status: 400, code: 'VALIDATION_FAILED' });
    expect(response.body.errors).toEqual([expect.objectContaining({ path: field })]);
  });

  it('001-AS3: rejects a slot for an unknown discipline (404, DISCIPLINE_NOT_FOUND)', async () => {
    const response = await api()
      .post(`/api/disciplines/${UNKNOWN_ID}/slots`)
      .send({ startsAt: NINE, endsAt: NOON, capacity: 2 })
      .expect(404);

    expect(response.body).toMatchObject({ status: 404, code: 'DISCIPLINE_NOT_FOUND' });
  });

  it('001-AS4: registers Awa Diop (201) with her name and email', async () => {
    const slot = await openSlot();
    const response = await register(slot.id, 'Awa Diop', 'awa@example.org').expect(201);

    expect(registrationSchema.parse(response.body)).toMatchObject({
      slotId: slot.id,
      name: 'Awa Diop',
      email: 'awa@example.org',
    });
  });

  it.each([
    ['', 'awa@example.org', 'name'],
    ['   ', 'awa@example.org', 'name'],
    ['Awa Diop', 'awa-at-example', 'email'],
  ])(
    '001-AS5: rejects an invalid registration (400, VALIDATION_FAILED) and stores nothing (%j, %j)',
    async (name, email, field) => {
      const slot = await openSlot(1);
      const response = await register(slot.id, name, email).expect(400);

      expect(response.body).toMatchObject({ status: 400, code: 'VALIDATION_FAILED' });
      expect(response.body.errors).toEqual([expect.objectContaining({ path: field })]);
      // Capacité 1 : la place est encore libre, donc rien n'a été compté.
      await register(slot.id, 'Awa Diop', 'awa@example.org').expect(201);
    },
  );

  it('001-AS6: rejects a third registration (409, SLOT_FULL)', async () => {
    const slot = await openSlot(2);
    await register(slot.id, 'Awa Diop', 'awa@example.org').expect(201);
    await register(slot.id, 'Moussa Fall', 'moussa@example.org').expect(201);

    const response = await register(slot.id, 'Fatou Sow', 'fatou@example.org').expect(409);
    expect(response.body).toMatchObject({ status: 409, code: 'SLOT_FULL' });
  });

  it('001-AS7: rejects a registration on an unknown slot (404, SLOT_NOT_FOUND)', async () => {
    const response = await register(UNKNOWN_ID, 'Awa Diop', 'awa@example.org').expect(404);

    expect(response.body).toMatchObject({ status: 404, code: 'SLOT_NOT_FOUND' });
  });
});
