import * as React from 'react'

export interface ThemeProviderProps {
  children: React.ReactNode
}

export function ThemeProvider({ 
  children
}: ThemeProviderProps) {
  const [theme] = React.useState<string>('light')

  return (
    <div data-theme={theme}>
      {children}
    </div>
  )
}
