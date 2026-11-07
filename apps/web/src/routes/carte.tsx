import { createFileRoute } from '@tanstack/react-router';
import { z } from 'zod';
import { MapPage } from '@/features/map/components/map-page';

/** `/carte?lieu=…&jour=AAAA-MM-JJ` ouvre la carte sur ce lieu et ce jour (depuis « Y aller »). */
const searchSchema = z.object({
  lieu: z.string().optional().catch(undefined),
  jour: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional()
    .catch(undefined),
});

function MapRoute() {
  const { lieu, jour } = Route.useSearch();
  return <MapPage initialPlace={lieu} initialDate={jour} />;
}

export const Route = createFileRoute('/carte')({
  component: MapRoute,
  validateSearch: searchSchema,
});
