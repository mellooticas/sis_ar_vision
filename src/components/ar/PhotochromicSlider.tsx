'use client'

import { useState } from 'react'
import {
  PHOTOCHROMIC_PROFILES,
  computePhotochromicColor,
  computeTransmittance,
  type PhotochromicProfile,
} from '@/lib/optics/photochromic'

interface PhotochromicSliderProps {
  onColorChange?: (color: string) => void
}

const UV_LABELS = [
  { value: 0, label: 'Interior' },
  { value: 0.3, label: 'Sombra' },
  { value: 0.6, label: 'Nublado' },
  { value: 1, label: 'Sol' },
]

export function PhotochromicSlider({ onColorChange }: PhotochromicSliderProps) {
  const [uvLevel, setUvLevel] = useState(0)
  const [selectedProfile, setSelectedProfile] = useState<PhotochromicProfile>(
    PHOTOCHROMIC_PROFILES[0]
  )

  const handleUvChange = (value: number) => {
    setUvLevel(value)
    const color = computePhotochromicColor(selectedProfile, value)
    onColorChange?.(color)
  }

  const handleProfileChange = (profile: PhotochromicProfile) => {
    setSelectedProfile(profile)
    const color = computePhotochromicColor(profile, uvLevel)
    onColorChange?.(color)
  }

  const currentColor = computePhotochromicColor(selectedProfile, uvLevel)
  const transmittance = computeTransmittance(selectedProfile, uvLevel)

  return (
    <div className="space-y-4">
      {/* Profile selector */}
      <div>
        <p className="text-xs font-medium text-muted-foreground mb-2">Cor da lente</p>
        <div className="flex gap-2">
          {PHOTOCHROMIC_PROFILES.map((profile) => (
            <button
              key={profile.id}
              type="button"
              onClick={() => handleProfileChange(profile)}
              className={[
                'flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors',
                selectedProfile.id === profile.id
                  ? 'border-primary bg-primary/5 font-medium'
                  : 'border-border hover:bg-accent/50',
              ].join(' ')}
            >
              <div
                className="h-4 w-4 rounded-full border border-border"
                style={{ backgroundColor: profile.baseColor }}
              />
              {profile.name}
            </button>
          ))}
        </div>
      </div>

      {/* UV slider */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-medium text-muted-foreground">Exposicao UV</p>
          <p className="text-xs text-muted-foreground">
            Transmitancia: <span className="font-mono font-medium">{transmittance}%</span>
          </p>
        </div>
        <input
          type="range"
          min={0}
          max={100}
          value={uvLevel * 100}
          onChange={(e) => handleUvChange(Number(e.target.value) / 100)}
          className="w-full accent-primary"
        />
        <div className="flex justify-between mt-1">
          {UV_LABELS.map((label) => (
            <span key={label.value} className="text-[10px] text-muted-foreground">
              {label.label}
            </span>
          ))}
        </div>
      </div>

      {/* Color preview */}
      <div className="flex items-center gap-3">
        <div
          className="h-12 w-12 rounded-full border-2 border-border transition-colors duration-500"
          style={{ backgroundColor: currentColor }}
        />
        <div className="text-sm">
          <p className="font-medium">{selectedProfile.name}</p>
          <p className="text-xs text-muted-foreground">
            Ativacao: ~{selectedProfile.activationTimeSec}s | Retorno: ~{Math.round(selectedProfile.fadeBackTimeSec / 60)}min
          </p>
        </div>
      </div>
    </div>
  )
}
