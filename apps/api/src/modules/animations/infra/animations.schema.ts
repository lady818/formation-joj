// Lu par drizzle-kit pour générer les migrations : ce fichier n'importe que drizzle-orm.
import { index, pgTable, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';

export const animations = pgTable(
  'animations',
  {
    id: uuid('id').primaryKey(),
    title: varchar('title', { length: 150 }).notNull(),
    place: varchar('place', { length: 150 }).notNull(),
    // Précision milliseconde = celle de Date en JavaScript.
    startsAt: timestamp('starts_at', { withTimezone: true, precision: 3 }).notNull(),
    endsAt: timestamp('ends_at', { withTimezone: true, precision: 3 }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true, precision: 3 }).notNull(),
  },
  // Lecture de l'agenda d'un jour : les animations qui commencent entre deux instants.
  (table) => [index('animations_starts_at_idx').on(table.startsAt)],
);

export type AnimationRow = typeof animations.$inferSelect;
