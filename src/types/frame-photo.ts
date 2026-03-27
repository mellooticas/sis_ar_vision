export type FramePhotoAngle = 'frontal' | '45deg' | 'lateral' | 'closed' | 'detail'

/** Ordered list — first 3 are required, last 2 are optional */
export const FRAME_PHOTO_ANGLES: FramePhotoAngle[] = [
  'frontal',
  '45deg',
  'lateral',
  'closed',
  'detail',
]

export const REQUIRED_ANGLES: FramePhotoAngle[] = ['frontal', '45deg', 'lateral']
export const OPTIONAL_ANGLES: FramePhotoAngle[] = ['closed', 'detail']

export const ANGLE_LABELS: Record<FramePhotoAngle, string> = {
  frontal: 'Frontal',
  '45deg': '45°',
  lateral: 'Lateral',
  closed: 'Fechada',
  detail: 'Detalhe',
}

export const ANGLE_DESCRIPTIONS: Record<FramePhotoAngle, string> = {
  frontal: 'Frente, hastes abertas sobre superfície',
  '45deg': 'Perspectiva 3/4, mostra profundidade',
  lateral: 'Perfil 90°, haste e dobradiça visíveis',
  closed: 'Armação fechada, vista de cima',
  detail: 'Macro: logo, dobradiça ou textura',
}

export type FrameShapeType =
  | 'rectangular'
  | 'round'
  | 'aviator'
  | 'cat_eye'
  | 'wayfarer'
  | 'oval'
  | 'wraparound'
  | 'other'

export const FRAME_SHAPES: FrameShapeType[] = [
  'rectangular',
  'round',
  'aviator',
  'cat_eye',
  'wayfarer',
  'oval',
  'wraparound',
  'other',
]

export const FRAME_SHAPE_LABELS: Record<FrameShapeType, string> = {
  rectangular: 'Retangular',
  round: 'Redonda',
  aviator: 'Aviador',
  cat_eye: 'Cat-Eye',
  wayfarer: 'Wayfarer',
  oval: 'Oval',
  wraparound: 'Esportiva',
  other: 'Outro',
}

export interface FramePhoto {
  angle: FramePhotoAngle
  blob: Blob
  localUrl: string
  remoteUrl?: string
  timestamp: number
}

export interface ProductImageRecord {
  id: string
  product_id: string
  tenant_id: string
  image_type: string
  angle: FramePhotoAngle | null
  frame_shape: FrameShapeType | null
  storage_path: string
  display_order: number
  width_px: number | null
  height_px: number | null
  file_size_bytes: number | null
  metadata: Record<string, unknown>
  captured_by: string | null
  created_at: string
  updated_at: string
}
