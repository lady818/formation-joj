import { type AgendaQuery, type AnimationResponse, animationListSchema } from '@joj/shared';
import { api } from '@/lib/api';

/**
 * Les appels HTTP de la fonctionnalité, sans React ni cache : un appel par route de l'API,
 * réponse validée par le schéma partagé. Le cache et les hooks sont dans `animations.queries.ts`.
 */
export const animationsApi = {
  dayAgenda: ({ date, at }: AgendaQuery, signal?: AbortSignal) => {
    const query = new URLSearchParams({ date, ...(at ? { at } : {}) });
    return api.request<AnimationResponse[]>(`/animations?${query.toString()}`, {
      schema: animationListSchema,
      signal,
    });
  },
};
