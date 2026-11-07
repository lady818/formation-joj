// Lu par drizzle-kit pour générer les migrations : ce fichier n'importe que drizzle-orm et
// d'autres schémas.
import { sql } from 'drizzle-orm';
import { check, integer, pgTable, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';
import { disciplines } from '../../disciplines/infra/disciplines.schema';

export const slots = pgTable(
  'slots',
  {
    id: uuid('id').primaryKey(),
    // Un créneau appartient à une discipline existante (001-AS3).
    disciplineId: uuid('discipline_id')
      .notNull()
      .references(() => disciplines.id, { onDelete: 'cascade' }),
    // Précision milliseconde = celle de Date en JavaScript.
    startsAt: timestamp('starts_at', { withTimezone: true, precision: 3 }).notNull(),
    endsAt: timestamp('ends_at', { withTimezone: true, precision: 3 }).notNull(),
    capacity: integer('capacity').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true, precision: 3 }).notNull(),
  },
  (table) => [
    check('slots_ends_after_starts', sql`${table.endsAt} > ${table.startsAt}`),
    check('slots_capacity_positive', sql`${table.capacity} >= 1`),
  ],
);

export const registrations = pgTable('registrations', {
  id: uuid('id').primaryKey(),
  // Une inscription porte sur un créneau existant (001-AS7).
  slotId: uuid('slot_id')
    .notNull()
    .references(() => slots.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 100 }).notNull(),
  email: varchar('email', { length: 254 }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true, precision: 3 }).notNull(),
});

export type SlotRow = typeof slots.$inferSelect;
export type RegistrationRow = typeof registrations.$inferSelect;
