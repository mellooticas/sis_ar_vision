'use client'

import { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'light' | 'dark' | 'auto'

interface ThemeContextType {
  theme: Theme
  resolvedTheme: 'light' | 'dark'
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('dark')
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('dark')

  const getSystemTheme = (): 'light' | 'dark' => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    }
    return 'light'
  }

  const resolveTheme = (currentTheme: Theme): 'light' | 'dark' => {
    if (currentTheme === 'auto') return getSystemTheme()
    return currentTheme
  }

  useEffect(() => {
    const savedTheme = localStorage.getItem('clearix-ar-vision-theme') as Theme | null
    if (savedTheme) {
      setThemeState(savedTheme)
      setResolvedTheme(resolveTheme(savedTheme))
    } else {
      setResolvedTheme(getSystemTheme())
    }
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return

    const root = document.documentElement
    root.classList.remove('light', 'dark')

    if (resolvedTheme === 'dark') {
      root.classList.add('dark')
    }

    root.style.setProperty('color-scheme', resolvedTheme)
  }, [resolvedTheme])

  useEffect(() => {
    if (theme !== 'auto') return

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = (e: MediaQueryListEvent) => {
      setResolvedTheme(e.matches ? 'dark' : 'light')
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [theme])

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme)
    setResolvedTheme(resolveTheme(newTheme))
    localStorage.setItem('clearix-ar-vision-theme', newTheme)
  }

  const toggleTheme = () => {
    const newTheme = resolvedTheme === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
  }

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
