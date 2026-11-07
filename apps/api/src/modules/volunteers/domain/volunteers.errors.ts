import { AppError, type ErrorKind } from '../../../core/errors/app-error';

/** Codes stables exposés aux clients ; la catégorie décide du statut HTTP. */
const VOLUNTEER_ERROR_KINDS = {
  /** La capacité n'est pas un entier d'au moins 1. */
  SLOT_CAPACITY_INVALID: 'VALIDATION',
  /** La fin n'est pas strictement après le début. */
  SLOT_ENDS_BEFORE_START: 'VALIDATION',
  /** Nom vide, ou fait seulement d'espaces. */
  REGISTRATION_NAME_REQUIRED: 'VALIDATION',
  REGISTRATION_NAME_TOO_LONG: 'VALIDATION',
  /** Email sans forme d'email, ou trop long. */
  REGISTRATION_EMAIL_INVALID: 'VALIDATION',
  /** Le créneau compte déjà autant d'inscrits que sa capacité. */
  SLOT_FULL: 'CONFLICT',
} as const satisfies Record<string, ErrorKind>;

export type VolunteerErrorCode = keyof typeof VOLUNTEER_ERROR_KINDS;

export class VolunteerError extends AppError<VolunteerErrorCode> {
  constructor(code: VolunteerErrorCode, message: string, details?: Record<string, unknown>) {
    super(code, VOLUNTEER_ERROR_KINDS[code], message, details);
  }
}
