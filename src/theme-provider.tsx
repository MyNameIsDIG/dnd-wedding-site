import * as React from 'react'

export interface ThemeProviderProps {
  children: React.ReactNode
  attribute?: string
  defaultTheme?: string
  storageKey?: string
}

export function ThemeProvider({ 
  children, 
  defaultTheme = 'system',
  storageKey = 'theme'
}: ThemeProviderProps) {
  const [theme, setTheme] = React.useState<string>(defaultTheme)

  React.useEffect(() => {
    const stored = localStorage.getItem(storageKey)
    if (stored) {
      setTheme(stored)
    }
  }, [storageKey])

  return (
    <div data-theme={theme}>
      {children}
    </div>
  )
}
