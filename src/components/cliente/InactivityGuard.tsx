'use client'

import { useEffect, useRef, useState, useCallback } from 'react'

interface InactivityGuardProps {
  timeoutMs?: number
  warningMs?: number
  onReset: () => void
  children: React.ReactNode
}

/**
 * Wraps content with inactivity detection.
 * Shows warning before resetting session after idle timeout.
 */
export function InactivityGuard({
  timeoutMs = 3 * 60 * 1000,
  warningMs = 30 * 1000,
  onReset,
  children,
}: InactivityGuardProps) {
  const [showWarning, setShowWarning] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const resetTimer = useCallback(() => {
    setShowWarning(false)
    if (timerRef.current) clearTimeout(timerRef.current)
    if (countdownRef.current) clearInterval(countdownRef.current)

    timerRef.current = setTimeout(() => {
      setShowWarning(true)
      setCountdown(Math.ceil(warningMs / 1000))

      countdownRef.current = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(countdownRef.current!)
            onReset()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }, timeoutMs - warningMs)
  }, [timeoutMs, warningMs, onReset])

  useEffect(() => {
    const events = ['pointerdown', 'pointermove', 'keydown', 'scroll', 'touchstart']

    const handleActivity = () => resetTimer()

    events.forEach((e) => window.addEventListener(e, handleActivity, { passive: true }))
    resetTimer()

    return () => {
      events.forEach((e) => window.removeEventListener(e, handleActivity))
      if (timerRef.current) clearTimeout(timerRef.current)
      if (countdownRef.current) clearInterval(countdownRef.current)
    }
  }, [resetTimer])

  return (
    <>
      {children}

      {showWarning && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="rounded-2xl bg-card p-8 text-center shadow-2xl max-w-sm mx-4">
            <p className="text-4xl font-bold font-heading mb-2">{countdown}</p>
            <p className="text-lg font-medium mb-4">Voce ainda esta ai?</p>
            <p className="text-sm text-muted-foreground mb-6">
              A sessao sera reiniciada por inatividade
            </p>
            <button
              type="button"
              onClick={resetTimer}
              className="w-full rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground"
            >
              Continuar
            </button>
          </div>
        </div>
      )}
    </>
  )
}
