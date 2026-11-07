import { randomUUID } from 'node:crypto';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { type DatabaseConnection, openDatabase } from '../../../core/database/database';
import { animations } from './animations.schema';
import { DrizzleAnimationRepository } from './drizzle-animation.repository';

const row = (title: string, startsAt: string, endsAt: string) => ({
  id: randomUUID(),
  title,
  place: 'Village des Jeux, Diamniadio',
  startsAt: new Date(startsAt),
  endsAt: new Date(endsAt),
  createdAt: new Date('2026-10-01T08:00:00.123Z'),
});

describe('DrizzleAnimationRepository (in-memory PGlite, migrations applied)', () => {
  let connection: DatabaseConnection;
  let repository: DrizzleAnimationRepository;
  const breaking = row(
    'Initiation au breaking',
    '2026-11-01T10:00:00.000Z',
    '2026-11-01T12:00:00.000Z',
  );

  beforeAll(async () => {
    connection = openDatabase({ pgliteDataDir: 'memory://' });
    await connection.migrate();
    repository = new DrizzleAnimationRepository(connection.db);
    await connection.db
      .insert(animations)
      .values([
        row('Veillée de la veille', '2026-10-31T23:30:00.000Z', '2026-11-01T01:00:00.000Z'),
        row('Réveil musculaire', '2026-11-01T00:00:00.000Z', '2026-11-01T01:00:00.000Z'),
        breaking,
        row('Tournoi de dames', '2026-11-02T10:00:00.000Z', '2026-11-02T12:00:00.000Z'),
        row('Course de minuit', '2026-11-02T00:00:00.000Z', '2026-11-02T01:00:00.000Z'),
      ]);
  });

  afterAll(() => connection?.close());

  it('002-AS2: lists only the animations starting on the requested day', async () => {
    const found = await repository.listStartingBetween(
      new Date('2026-11-01T00:00:00.000Z'),
      new Date('2026-11-02T00:00:00.000Z'),
    );

    expect(found.map((animation) => animation.title).sort()).toEqual([
      'Initiation au breaking',
      'Réveil musculaire',
    ]);
    expect(found.find((animation) => animation.id === breaking.id)).toMatchObject({
      title: breaking.title,
      place: breaking.place,
      startsAt: breaking.startsAt,
      endsAt: breaking.endsAt,
      createdAt: breaking.createdAt,
    });
  });
});
