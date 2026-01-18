'use client'

import { useMemo } from 'react'
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles'
import { useMediaQuery } from '@mui/material'
import CssBaseline from '@mui/material/CssBaseline'
import { lightTheme, darkTheme } from '@/theme/theme'

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)')

  const theme = useMemo(
    () => (prefersDarkMode ? darkTheme : lightTheme),
    [prefersDarkMode]
  )

  return (
    <MuiThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </MuiThemeProvider>
  )
}