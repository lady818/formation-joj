import { z } from 'zod';

/**
 * Paramètres de `GET /api/animations` : un jour qui existe (`AAAA-MM-JJ`) et, pour le filtre
 * « en cours », une heure facultative `HH:MM`. Dakar est à UTC+0 : le jour est un jour UTC.
 */
export const agendaQuerySchema = z.object({
  date: z.iso.date(),
  at: z.iso.time({ precision: -1 }).optional(),
});
export type AgendaQuery = z.infer<typeof agendaQuerySchema>;

/** Une animation telle que l'API la renvoie. */
export const animationSchema = z.object({
  id: z.uuid(),
  title: z.string(),
  place: z.string(),
  startsAt: z.iso.datetime(),
  endsAt: z.iso.datetime(),
});
export type AnimationResponse = z.infer<typeof animationSchema>;

export const animationListSchema = z.array(animationSchema);
