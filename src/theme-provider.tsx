import * as React from 'react'

export interface ThemeProviderProps {
  children: React.ReactNode
  attribute?: string
  defaultTheme?: string
  storageKey?: string
}

export function ThemeProvider({ 
  children, 
  defaultTheme = 'light',
  storageKey = 'theme'
}: ThemeProviderProps) {
  const [theme] = React.useState<string>('light')

  return (
    <div data-theme={theme}>
      {children}
    </div>
  )
}
