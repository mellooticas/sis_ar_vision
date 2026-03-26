/**
 * lens-thickness.ts — Optical lens thickness calculator
 *
 * Calculates real lens thickness based on prescription (SPH, CYL)
 * and lens material refractive index.
 *
 * Formula: Sagitta = (D² × |P|) / (8 × (n-1) × 1000)
 * Where:
 *   D = lens diameter in mm
 *   P = power in diopters
 *   n = refractive index
 *
 * - Minus (myopia): thick edges → edge = center + sag
 * - Plus (hyperopia): thick center → center = edge + sag
 */

export interface LensMaterial {
  id: string
  name: string
  index: number
  abbeName: string
  priceMultiplier: number
}

export interface LensThicknessResult {
  material: LensMaterial
  centerThickness: number
  edgeThickness: number
  maxThickness: number
  weight: number
}

export interface LensComparisonResult {
  prescription: { sph: number; cyl: number }
  diameter: number
  results: LensThicknessResult[]
}

/** Common lens materials used in Brazilian optical market */
export const LENS_MATERIALS: LensMaterial[] = [
  { id: 'cr39', name: 'CR-39', index: 1.50, abbeName: 'Abbe 58', priceMultiplier: 1.0 },
  { id: 'mr8', name: 'Policarbonato', index: 1.59, abbeName: 'Abbe 30', priceMultiplier: 1.4 },
  { id: 'mr7', name: 'MR-7 (1.67)', index: 1.67, abbeName: 'Abbe 32', priceMultiplier: 2.2 },
  { id: 'mr174', name: 'MR-174 (1.74)', index: 1.74, abbeName: 'Abbe 33', priceMultiplier: 3.5 },
]

/** Minimum center thickness for minus lenses (mm) */
const MIN_CENTER_THICKNESS = 1.5

/** Minimum edge thickness for plus lenses (mm) */
const MIN_EDGE_THICKNESS = 1.2

/** Density of CR-39 as baseline (g/cm³) */
const DENSITY_BASELINE = 1.32

/**
 * Calculate sagitta (sag) for a given power, diameter, and refractive index.
 */
function sagitta(power: number, diameter: number, refractiveIndex: number): number {
  return (diameter * diameter * Math.abs(power)) / (8 * (refractiveIndex - 1) * 1000)
}

/**
 * Calculate lens thickness for a specific material.
 *
 * @param sph - Spherical power in diopters
 * @param cyl - Cylindrical power in diopters (negative convention)
 * @param diameter - Lens diameter in mm (typically 60-70mm)
 * @param material - Lens material
 */
export function calculateLensThickness(
  sph: number,
  cyl: number,
  diameter: number,
  material: LensMaterial,
): LensThicknessResult {
  // Use the most powerful meridian for worst-case thickness
  const maxPower = Math.max(Math.abs(sph), Math.abs(sph + cyl))
  const sag = sagitta(maxPower, diameter, material.index)

  let centerThickness: number
  let edgeThickness: number

  if (sph <= 0) {
    // Minus lens (myopia): thick edges
    centerThickness = MIN_CENTER_THICKNESS
    edgeThickness = centerThickness + sag
  } else {
    // Plus lens (hyperopia): thick center
    edgeThickness = MIN_EDGE_THICKNESS
    centerThickness = edgeThickness + sag
  }

  const maxThickness = Math.max(centerThickness, edgeThickness)

  // Approximate weight (simplified cylinder volume)
  const avgThickness = (centerThickness + edgeThickness) / 2
  const radiusCm = diameter / 20
  const volumeCm3 = Math.PI * radiusCm * radiusCm * (avgThickness / 10)
  const densityFactor = material.index / 1.50
  const weight = volumeCm3 * DENSITY_BASELINE * densityFactor

  return {
    material,
    centerThickness: Math.round(centerThickness * 10) / 10,
    edgeThickness: Math.round(edgeThickness * 10) / 10,
    maxThickness: Math.round(maxThickness * 10) / 10,
    weight: Math.round(weight * 10) / 10,
  }
}

/**
 * Compare lens thickness across all standard materials.
 */
export function compareLensThickness(
  sph: number,
  cyl: number,
  diameter: number = 65,
): LensComparisonResult {
  const results = LENS_MATERIALS.map((material) =>
    calculateLensThickness(sph, cyl, diameter, material),
  )

  return {
    prescription: { sph, cyl },
    diameter,
    results,
  }
}
