'use client'

import { useState, useCallback } from 'react'
import { Delete } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CPFInputProps {
  onSubmit: (cpf: string) => void
  className?: string
}

function formatCPF(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11)
  if (digits.length <= 3) return digits
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`
  if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`
}

/**
 * Touch-friendly numeric keypad for CPF input.
 * Designed for tablet use in optical shops.
 */
export function CPFInput({ onSubmit, className }: CPFInputProps) {
  const [value, setValue] = useState('')

  const digits = value.replace(/\D/g, '')

  const handleDigit = useCallback((digit: string) => {
    setValue((prev) => {
      const current = prev.replace(/\D/g, '')
      if (current.length >= 11) return prev
      return formatCPF(current + digit)
    })
  }, [])

  const handleDelete = useCallback(() => {
    setValue((prev) => {
      const current = prev.replace(/\D/g, '')
      return formatCPF(current.slice(0, -1))
    })
  }, [])

  const handleSubmit = useCallback(() => {
    if (digits.length === 11) {
      onSubmit(digits)
    }
  }, [digits, onSubmit])

  const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'del', '0', 'ok']

  return (
    <div className={cn('flex flex-col items-center gap-6', className)}>
      {/* Display */}
      <div className="w-full max-w-xs">
        <input
          type="text"
          value={value}
          readOnly
          placeholder="000.000.000-00"
          className="w-full rounded-xl border-2 bg-background px-4 py-4 text-center text-2xl font-mono tracking-widest outline-none focus:border-primary"
        />
      </div>

      {/* Numpad */}
      <div className="grid grid-cols-3 gap-2 w-full max-w-xs">
        {keys.map((key) => {
          if (key === 'del') {
            return (
              <button
                key={key}
                type="button"
                onClick={handleDelete}
                className="flex h-14 items-center justify-center rounded-xl border bg-card text-lg font-medium hover:bg-muted active:scale-95 transition-transform"
              >
                <Delete className="h-5 w-5" />
              </button>
            )
          }
          if (key === 'ok') {
            return (
              <button
                key={key}
                type="button"
                onClick={handleSubmit}
                disabled={digits.length !== 11}
                className={cn(
                  'flex h-14 items-center justify-center rounded-xl text-lg font-semibold transition-transform active:scale-95',
                  digits.length === 11
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground',
                )}
              >
                OK
              </button>
            )
          }
          return (
            <button
              key={key}
              type="button"
              onClick={() => handleDigit(key)}
              className="flex h-14 items-center justify-center rounded-xl border bg-card text-xl font-medium hover:bg-muted active:scale-95 transition-transform"
            >
              {key}
            </button>
          )
        })}
      </div>
    </div>
  )
}
