/**
 * Photochromic lens simulation.
 *
 * Models 3 color profiles (gray, brown, green) with non-linear
 * activation curves based on UV exposure level.
 */

export interface PhotochromicProfile {
  id: string
  name: string
  nameEn: string
  /** Base color when fully activated (hex) */
  baseColor: string
  /** Activation time (seconds) to reach 80% */
  activationTimeSec: number
  /** Fade-back time (seconds) to reach 80% clear */
  fadeBackTimeSec: number
  /** Maximum transmittance reduction (0-1) — 0.85 means only 15% light passes at full UV */
  maxDarkening: number
  /** Minimum transmittance (clear state, 0-1) — e.g., 0.92 means 92% light passes */
  clearTransmittance: number
}

export const PHOTOCHROMIC_PROFILES: PhotochromicProfile[] = [
  {
    id: 'gray',
    name: 'Cinza',
    nameEn: 'Gray',
    baseColor: '#4a4a4a',
    activationTimeSec: 30,
    fadeBackTimeSec: 180,
    maxDarkening: 0.82,
    clearTransmittance: 0.92,
  },
  {
    id: 'brown',
    name: 'Marrom',
    nameEn: 'Brown',
    baseColor: '#6b4226',
    activationTimeSec: 35,
    fadeBackTimeSec: 200,
    maxDarkening: 0.78,
    clearTransmittance: 0.90,
  },
  {
    id: 'green',
    name: 'Verde',
    nameEn: 'Green',
    baseColor: '#2d5a27',
    activationTimeSec: 40,
    fadeBackTimeSec: 210,
    maxDarkening: 0.75,
    clearTransmittance: 0.91,
  },
]

/**
 * Compute the photochromic lens color at a given UV level.
 *
 * @param profile - The color profile to use
 * @param uvLevel - UV exposure 0 (indoor) to 1 (full sun)
 * @returns rgba color string
 */
export function computePhotochromicColor(
  profile: PhotochromicProfile,
  uvLevel: number
): string {
  const t = Math.max(0, Math.min(1, uvLevel))

  // Non-linear activation: fast initial darkening, then plateaus
  const activation = Math.pow(t, 0.7)

  // Opacity: from near-transparent to profile max
  const opacity = activation * profile.maxDarkening

  return hexToRgba(profile.baseColor, opacity)
}

/**
 * Compute the transmittance percentage at a given UV level.
 *
 * @returns Value 0-100 representing % of visible light transmitted
 */
export function computeTransmittance(
  profile: PhotochromicProfile,
  uvLevel: number
): number {
  const t = Math.max(0, Math.min(1, uvLevel))
  const activation = Math.pow(t, 0.7)
  const transmittance =
    profile.clearTransmittance -
    activation * (profile.clearTransmittance - (1 - profile.maxDarkening))
  return Math.round(transmittance * 100)
}

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha.toFixed(3)})`
}
