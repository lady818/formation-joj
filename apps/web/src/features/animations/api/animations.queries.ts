import { queryOptions, useQuery } from '@tanstack/react-query';
import { animationsApi } from './animations.api';

/** Clés du cache TanStack Query pour cette fonctionnalité. */
export const animationKeys = {
  all: ['animations'] as const,
  day: (date: string, at: string | undefined) =>
    [...animationKeys.all, 'day', date, at ?? null] as const,
};

export const dayAgendaQueryOptions = (date: string, at?: string) =>
  queryOptions({
    queryKey: animationKeys.day(date, at),
    queryFn: ({ signal }) => animationsApi.dayAgenda({ date, ...(at ? { at } : {}) }, signal),
    // Tant que le champ « Jour » est vide ou incomplet, rien n'est demandé à l'API.
    enabled: /^\d{4}-\d{2}-\d{2}$/.test(date),
  });

export const useDayAgenda = (date: string, at?: string) =>
  useQuery(dayAgendaQueryOptions(date, at));
