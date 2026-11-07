import type { INestApplication } from '@nestjs/common';
import { animationListSchema } from '@joj/shared';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import type { Database } from '../src/core/database/database';
import { DATABASE } from '../src/core/database/database.module';
import { animations } from '../src/modules/animations/infra/animations.schema';
import { createTestApp } from './create-test-app';

const CREATED_AT = new Date('2026-10-01T08:00:00.000Z');
const animation = (id: string, title: string, place: string, startsAt: string, endsAt: string) => ({
  id: `0199f5c2-0000-7000-8000-000000000${id}`,
  title,
  place,
  startsAt: new Date(startsAt),
  endsAt: new Date(endsAt),
  createdAt: CREATED_AT,
});

describe('/api/animations (e2e)', () => {
  let app: INestApplication;
  const api = () => request(app.getHttpServer());

  beforeAll(async () => {
    app = await createTestApp();
    // Aucune route n'écrit d'animation dans cette tranche (TR2) : on les insère en base.
    await app
      .get<Database>(DATABASE)
      .insert(animations)
      .values([
        animation(
          '301',
          'Concert de sabar',
          "Place de l'Obélisque",
          '2026-11-01T16:00:00Z',
          '2026-11-01T18:00:00Z',
        ),
        animation(
          '302',
          'Initiation au breaking',
          'Village des Jeux, Diamniadio',
          '2026-11-01T10:00:00Z',
          '2026-11-01T12:00:00Z',
        ),
        animation(
          '303',
          'Atelier lutte traditionnelle',
          'Arène nationale',
          '2026-11-01T14:00:00Z',
          '2026-11-01T15:30:00Z',
        ),
        animation(
          '304',
          'Tournoi de dames',
          'Maison de la culture Douta Seck',
          '2026-11-02T10:00:00Z',
          '2026-11-02T12:00:00Z',
        ),
      ]);
  });

  afterAll(() => app?.close());

  const agenda = async (query: Record<string, string>) => {
    const response = await api().get('/api/animations').query(query).expect(200);
    return animationListSchema.parse(response.body);
  };

  it('002-AS1: returns the day agenda sorted by start time, with places and times', async () => {
    expect(await agenda({ date: '2026-11-01' })).toEqual([
      {
        id: '0199f5c2-0000-7000-8000-000000000302',
        title: 'Initiation au breaking',
        place: 'Village des Jeux, Diamniadio',
        startsAt: '2026-11-01T10:00:00.000Z',
        endsAt: '2026-11-01T12:00:00.000Z',
      },
      {
        id: '0199f5c2-0000-7000-8000-000000000303',
        title: 'Atelier lutte traditionnelle',
        place: 'Arène nationale',
        startsAt: '2026-11-01T14:00:00.000Z',
        endsAt: '2026-11-01T15:30:00.000Z',
      },
      {
        id: '0199f5c2-0000-7000-8000-000000000301',
        title: 'Concert de sabar',
        place: "Place de l'Obélisque",
        startsAt: '2026-11-01T16:00:00.000Z',
        endsAt: '2026-11-01T18:00:00.000Z',
      },
    ]);
  });

  it('002-AS2: leaves out the animations of another day', async () => {
    const titles = (await agenda({ date: '2026-11-01' })).map((a) => a.title);
    expect(titles).toContain('Initiation au breaking');
    expect(titles).not.toContain('Tournoi de dames');
  });

  it('002-AS3: returns only the animations in progress at 15:00', async () => {
    const found = await agenda({ date: '2026-11-01', at: '15:00' });
    expect(found.map((a) => [a.title, a.place])).toEqual([
      ['Atelier lutte traditionnelle', 'Arène nationale'],
    ]);
  });

  it('002-AS5: returns an empty list (200) for a day or a time without animation', async () => {
    expect(await agenda({ date: '2026-11-03' })).toEqual([]);
    expect(await agenda({ date: '2026-11-01', at: '13:00' })).toEqual([]);
  });

  it.each([
    [{ date: '2026-11-31' }, 'date'],
    [{ date: '2026-11-01', at: '25:00' }, 'at'],
  ])(
    '002-AS6: rejects an unreadable day or time (400, VALIDATION_FAILED) %j',
    async (query, field) => {
      const response = await api().get('/api/animations').query(query).expect(400);

      expect(response.headers['content-type']).toMatch(/application\/problem\+json/);
      expect(response.body).toMatchObject({ status: 400, code: 'VALIDATION_FAILED' });
      expect(response.body.errors).toEqual([expect.objectContaining({ path: field })]);
    },
  );
});
