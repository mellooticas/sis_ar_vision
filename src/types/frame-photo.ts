export type FramePhotoAngle = 'frontal' | 'lateral' | '45deg'

export const FRAME_PHOTO_ANGLES: FramePhotoAngle[] = ['frontal', 'lateral', '45deg']

export const ANGLE_LABELS: Record<FramePhotoAngle, string> = {
  frontal: 'Frontal',
  lateral: 'Lateral',
  '45deg': '45°',
}

export interface FramePhoto {
  angle: FramePhotoAngle
  blob: Blob
  localUrl: string
  remoteUrl?: string
  timestamp: number
}
