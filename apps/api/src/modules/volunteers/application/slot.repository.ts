import type { Registration } from '../domain/registration';
import type { Slot } from '../domain/slot';

/**
 * Port de persistance des créneaux et de leurs inscriptions.
 * Implémenté par DrizzleSlotRepository (infra) et InMemorySlotRepository (tests).
 */
export abstract class SlotRepository {
  abstract insert(slot: Slot): Promise<void>;
  /** Le créneau avec son nombre d'inscrits, ou null. */
  abstract findById(id: string): Promise<Slot | null>;
  /**
   * Verrouille le créneau, le passe à `register` (qui applique la règle de capacité du domaine),
   * puis enregistre l'inscription renvoyée. Null si le créneau n'existe pas.
   * Deux appels simultanés sur un même créneau passent l'un après l'autre.
   */
  abstract registerInSlot(
    slotId: string,
    register: (slot: Slot) => Registration,
  ): Promise<Registration | null>;
}
