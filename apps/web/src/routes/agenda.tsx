import { createFileRoute } from '@tanstack/react-router';
import { AgendaPage } from '@/features/animations/components/agenda-page';

export const Route = createFileRoute('/agenda')({ component: AgendaPage });
