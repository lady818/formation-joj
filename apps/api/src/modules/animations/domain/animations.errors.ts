import { AppError, type ErrorKind } from '../../../core/errors/app-error';

/** Codes stables exposés aux clients ; la catégorie décide du statut HTTP. */
const ANIMATION_ERROR_KINDS = {
  /** Le jour n'existe pas, ou n'est pas au format AAAA-MM-JJ. */
  AGENDA_DATE_INVALID: 'VALIDATION',
  /** L'heure n'est pas une heure HH:MM entre 00:00 et 23:59. */
  AGENDA_TIME_INVALID: 'VALIDATION',
} as const satisfies Record<string, ErrorKind>;

export type AnimationErrorCode = keyof typeof ANIMATION_ERROR_KINDS;

export class AnimationError extends AppError<AnimationErrorCode> {
  constructor(code: AnimationErrorCode, message: string, details?: Record<string, unknown>) {
    super(code, ANIMATION_ERROR_KINDS[code], message, details);
  }
}
