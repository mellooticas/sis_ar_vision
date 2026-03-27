/**
 * Lens tint options for AR try-on visualization.
 */

export interface LensTint {
  id: string
  name: string
  /** CSS color value */
  color: string
  /** Opacity 0-1 */
  opacity: number
  /** Gradient direction (for degrade tints) */
  gradient?: 'top-to-bottom'
  /** Mirror/reflective effect */
  mirror?: boolean
}

export const LENS_TINTS: LensTint[] = [
  {
    id: 'clear',
    name: 'Transparente',
    color: 'transparent',
    opacity: 0,
  },
  {
    id: 'gray-solar',
    name: 'Cinza Solar',
    color: '#4a4a4a',
    opacity: 0.7,
  },
  {
    id: 'brown-solar',
    name: 'Marrom Solar',
    color: '#6b4226',
    opacity: 0.65,
  },
  {
    id: 'green-solar',
    name: 'Verde Solar',
    color: '#2d5a27',
    opacity: 0.6,
  },
  {
    id: 'gray-degrade',
    name: 'Cinza Degrade',
    color: '#4a4a4a',
    opacity: 0.65,
    gradient: 'top-to-bottom',
  },
  {
    id: 'brown-degrade',
    name: 'Marrom Degrade',
    color: '#6b4226',
    opacity: 0.60,
    gradient: 'top-to-bottom',
  },
  {
    id: 'mirror-silver',
    name: 'Espelhado Prata',
    color: '#c0c0c0',
    opacity: 0.8,
    mirror: true,
  },
  {
    id: 'mirror-blue',
    name: 'Espelhado Azul',
    color: '#1e40af',
    opacity: 0.75,
    mirror: true,
  },
  {
    id: 'mirror-gold',
    name: 'Espelhado Dourado',
    color: '#b8860b',
    opacity: 0.75,
    mirror: true,
  },
]
