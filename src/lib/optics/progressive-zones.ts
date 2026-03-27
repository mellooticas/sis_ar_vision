/**
 * Progressive lens zone calculator.
 *
 * Computes the 3 visual zones (distance, intermediate, near) based on
 * lens design tier and addition power (ADD).
 */

export type ProgressiveDesign = 'basico' | 'premium' | 'avancado'

export interface ProgressiveZone {
  /** Zone identifier */
  id: 'distance' | 'intermediate' | 'near'
  /** Display name (PT) */
  name: string
  /** Color for visualization */
  color: string
  /** Zone top position as fraction of lens height (0=top, 1=bottom) */
  top: number
  /** Zone bottom position as fraction of lens height */
  bottom: number
  /** Horizontal width as fraction of lens width at widest point */
  width: number
}

export interface ProgressiveResult {
  design: ProgressiveDesign
  addPower: number
  zones: ProgressiveZone[]
  corridorWidthMm: number
  designLabel: string
}

const DESIGN_CONFIG: Record<
  ProgressiveDesign,
  { label: string; baseCorridorMm: number; distanceWidth: number; nearWidth: number }
> = {
  basico: {
    label: 'Basico (Standard)',
    baseCorridorMm: 14,
    distanceWidth: 0.85,
    nearWidth: 0.45,
  },
  premium: {
    label: 'Premium (Free-Form)',
    baseCorridorMm: 16,
    distanceWidth: 0.90,
    nearWidth: 0.55,
  },
  avancado: {
    label: 'Avancado (Digital Individual)',
    baseCorridorMm: 18,
    distanceWidth: 0.95,
    nearWidth: 0.65,
  },
}

/**
 * Calculate progressive lens zones based on design and ADD power.
 *
 * Higher ADD → narrower intermediate corridor.
 * Better design → wider zones at all levels.
 *
 * @param design - Lens design tier
 * @param addPower - Addition power in diopters (0.75 to 3.50)
 * @returns Zone dimensions and metadata
 */
export function calculateProgressiveZones(
  design: ProgressiveDesign,
  addPower: number
): ProgressiveResult {
  const config = DESIGN_CONFIG[design]
  const add = Math.max(0.75, Math.min(3.5, addPower))

  // Higher ADD → narrower corridor
  // Corridor shrinks linearly: at ADD 0.75 = 100% width, at ADD 3.50 = ~60%
  const corridorFactor = 1 - ((add - 0.75) / 3.0) * 0.4
  const corridorWidthMm = Math.round(config.baseCorridorMm * corridorFactor * 10) / 10

  // Intermediate zone width narrows with ADD
  const intermediateWidth = config.nearWidth + (config.distanceWidth - config.nearWidth) * 0.5 * corridorFactor

  const zones: ProgressiveZone[] = [
    {
      id: 'distance',
      name: 'Longe',
      color: '#22c55e', // green-500
      top: 0,
      bottom: 0.35,
      width: config.distanceWidth,
    },
    {
      id: 'intermediate',
      name: 'Intermediario',
      color: '#eab308', // yellow-500
      top: 0.35,
      bottom: 0.65,
      width: intermediateWidth,
    },
    {
      id: 'near',
      name: 'Perto',
      color: '#3b82f6', // blue-500
      top: 0.65,
      bottom: 1.0,
      width: config.nearWidth * corridorFactor,
    },
  ]

  return {
    design,
    addPower: add,
    zones,
    corridorWidthMm,
    designLabel: config.label,
  }
}
