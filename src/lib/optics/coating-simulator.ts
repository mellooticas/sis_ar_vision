/**
 * Coating layer definitions for the lens treatment simulator.
 *
 * Each coating layer can be toggled on/off to demonstrate its visual effect.
 * Uses CSS filters for approximation and canvas effects for detailed demos.
 */

export interface CoatingLayer {
  id: string
  name: string
  nameEn: string
  description: string
  /** CSS filter string to approximate the coating effect */
  cssFilter: string
  /** Whether this is included in premium lens packages by default */
  defaultOn: boolean
  /** Display order */
  order: number
}

export const COATING_LAYERS: CoatingLayer[] = [
  {
    id: 'anti-reflective',
    name: 'Antirreflexo',
    nameEn: 'Anti-Reflective',
    description:
      'Reduz reflexos na superficie da lente, melhorando transparencia e aparencia. Essencial para uso noturno e telas.',
    cssFilter: 'contrast(1.08) brightness(1.03)',
    defaultOn: true,
    order: 1,
  },
  {
    id: 'hydrophobic',
    name: 'Hidrofobico',
    nameEn: 'Hydrophobic',
    description:
      'Repele agua e facilita limpeza. Goticulas escorrem rapidamente sem deixar marcas.',
    cssFilter: 'saturate(1.05)',
    defaultOn: true,
    order: 2,
  },
  {
    id: 'oleophobic',
    name: 'Oleofobico',
    nameEn: 'Oleophobic',
    description: 'Resiste a marcas de digitais e oleosidade. A lente permanece limpa por mais tempo.',
    cssFilter: 'contrast(1.03)',
    defaultOn: true,
    order: 3,
  },
  {
    id: 'anti-static',
    name: 'Antiestatico',
    nameEn: 'Anti-Static',
    description:
      'Reduz atracao de poeira e particulas. Ideal para ambientes com ar condicionado.',
    cssFilter: 'brightness(1.02)',
    defaultOn: false,
    order: 4,
  },
  {
    id: 'hard-coat',
    name: 'Endurecimento',
    nameEn: 'Hard Coat',
    description:
      'Camada de protecao contra riscos e arranhoes. Aumenta a durabilidade em ate 10x.',
    cssFilter: '',
    defaultOn: true,
    order: 5,
  },
  {
    id: 'blue-light',
    name: 'Filtro Luz Azul',
    nameEn: 'Blue Light Filter',
    description:
      'Filtra luz azul de telas digitais, reduzindo fadiga visual e melhorando o sono.',
    cssFilter: 'sepia(0.12) saturate(0.92)',
    defaultOn: false,
    order: 6,
  },
]

export type CoatingId = (typeof COATING_LAYERS)[number]['id']

/**
 * Combine active coating CSS filters into a single filter string.
 */
export function combineCssFilters(activeIds: Set<string>): string {
  return COATING_LAYERS.filter((c) => activeIds.has(c.id) && c.cssFilter)
    .map((c) => c.cssFilter)
    .join(' ')
}
