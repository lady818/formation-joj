import type { DisciplineCategory } from '@joj/shared';

export const CATEGORY_LABELS: Record<DisciplineCategory, string> = {
  athletisme: 'Athlétisme',
  'sports-collectifs': 'Sports collectifs',
  'sports-de-combat': 'Sports de combat',
  'sports-nautiques': 'Sports nautiques',
  'sports-de-precision': 'Sports de précision',
};

/** Une couleur par catégorie, pour les pastilles et les monogrammes. */
export const CATEGORY_TONES: Record<DisciplineCategory, string> = {
  athletisme: 'bg-senegal-green text-white',
  'sports-collectifs': 'bg-sunset text-white',
  'sports-de-combat': 'bg-senegal-red text-white',
  'sports-nautiques': 'bg-[oklch(0.55_0.13_235)] text-white',
  'sports-de-precision': 'bg-senegal-yellow text-[oklch(0.3_0.06_80)]',
};
