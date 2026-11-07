import { z } from 'zod';

export const SLOT_MIN_CAPACITY = 1;
export const VOLUNTEER_NAME_MAX_LENGTH = 100;
export const VOLUNTEER_EMAIL_MAX_LENGTH = 254;

/** Un instant ISO 8601 avec fuseau (`Z` ou `+01:00`). */
const instantSchema = z.iso.datetime({ offset: true });

/** Corps de `POST /api/disciplines/:disciplineId/slots`. */
export const openSlotSchema = z
  .object({
    startsAt: instantSchema,
    endsAt: instantSchema,
    capacity: z.int().min(SLOT_MIN_CAPACITY),
  })
  .refine((input) => Date.parse(input.endsAt) > Date.parse(input.startsAt), {
    message: 'The end must be after the start',
    path: ['endsAt'],
  });
export type OpenSlotInput = z.infer<typeof openSlotSchema>;

/** Corps de `POST /api/slots/:slotId/registrations`. */
export const registerVolunteerSchema = z.object({
  name: z.string().trim().min(1).max(VOLUNTEER_NAME_MAX_LENGTH),
  email: z.email().max(VOLUNTEER_EMAIL_MAX_LENGTH),
});
export type RegisterVolunteerInput = z.infer<typeof registerVolunteerSchema>;

/** Paramètre `:disciplineId` de l'ouverture d'un créneau. */
export const slotDisciplineParamsSchema = z.object({ disciplineId: z.uuid() });

/** Paramètre `:slotId` des routes d'un créneau. */
export const slotIdParamsSchema = z.object({ slotId: z.uuid() });

/** Un créneau tel que l'API le renvoie. */
export const slotSchema = z.object({
  id: z.uuid(),
  disciplineId: z.uuid(),
  startsAt: z.iso.datetime(),
  endsAt: z.iso.datetime(),
  capacity: z.int().min(SLOT_MIN_CAPACITY),
  registeredCount: z.int().min(0),
});
export type SlotResponse = z.infer<typeof slotSchema>;

/** Une inscription telle que l'API la renvoie. */
export const registrationSchema = z.object({
  id: z.uuid(),
  slotId: z.uuid(),
  name: z.string(),
  email: z.string(),
  createdAt: z.iso.datetime(),
});
export type RegistrationResponse = z.infer<typeof registrationSchema>;
