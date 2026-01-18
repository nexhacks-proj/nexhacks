'use client'

import { createTheme, ThemeOptions } from '@mui/material/styles'

// Material Design 3 color palette (blue primary theme)
const palette: ThemeOptions['palette'] = {
  mode: 'light',
  primary: {
    main: '#1976d2', // Material blue 700
    light: '#42a5f5', // Material blue 400
    dark: '#1565c0', // Material blue 800
    contrastText: '#ffffff',
  },
  secondary: {
    main: '#9c27b0', // Material purple 500
    light: '#ba68c8', // Material purple 300
    dark: '#7b1fa2', // Material purple 700
    contrastText: '#ffffff',
  },
  success: {
    main: '#2e7d32', // Material green 800
    light: '#4caf50', // Material green 500
    dark: '#1b5e20', // Material green 900
    contrastText: '#ffffff',
  },
  error: {
    main: '#d32f2f', // Material red 700
    light: '#ef5350', // Material red 400
    dark: '#c62828', // Material red 800
    contrastText: '#ffffff',
  },
  warning: {
    main: '#ed6c02', // Material orange 600
    light: '#ff9800', // Material orange 500
    dark: '#e65100', // Material orange 900
    contrastText: '#ffffff',
  },
  info: {
    main: '#0288d1', // Material light blue 700
    light: '#03a9f4', // Material light blue 500
    dark: '#01579b', // Material light blue 900
    contrastText: '#ffffff',
  },
  background: {
    default: '#f5f5f5', // Material grey 100
    paper: '#ffffff',
  },
  text: {
    primary: 'rgba(0, 0, 0, 0.87)',
    secondary: 'rgba(0, 0, 0, 0.6)',
    disabled: 'rgba(0, 0, 0, 0.38)',
  },
  divider: 'rgba(0, 0, 0, 0.12)',
}

// Dark mode palette
const darkPalette: ThemeOptions['palette'] = {
  ...palette,
  mode: 'dark',
  primary: {
    main: '#90caf9', // Material blue 200
    light: '#e3f2fd', // Material blue 50
    dark: '#42a5f5', // Material blue 400
    contrastText: '#000000', // Black text on light blue background
  },
  background: {
    default: '#121212',
    paper: '#1e1e1e',
  },
  text: {
    primary: 'rgba(255, 255, 255, 0.87)',
    secondary: 'rgba(255, 255, 255, 0.6)',
    disabled: 'rgba(255, 255, 255, 0.38)',
  },
  divider: 'rgba(255, 255, 255, 0.12)',
}

// Base theme configuration
const baseTheme: ThemeOptions = {
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
    h1: {
      fontSize: '3rem', // 48px
      fontWeight: 400,
      lineHeight: 1.167,
      letterSpacing: '-0.01562em',
    },
    h2: {
      fontSize: '2.5rem', // 40px
      fontWeight: 400,
      lineHeight: 1.2,
      letterSpacing: '-0.00833em',
    },
    h3: {
      fontSize: '2rem', // 32px
      fontWeight: 500,
      lineHeight: 1.167,
      letterSpacing: '0em',
    },
    h4: {
      fontSize: '1.75rem', // 28px
      fontWeight: 500,
      lineHeight: 1.235,
      letterSpacing: '0.00735em',
    },
    h5: {
      fontSize: '1.5rem', // 24px
      fontWeight: 500,
      lineHeight: 1.334,
      letterSpacing: '0em',
    },
    h6: {
      fontSize: '1.25rem', // 20px
      fontWeight: 500,
      lineHeight: 1.6,
      letterSpacing: '0.0075em',
    },
    body1: {
      fontSize: '1rem', // 16px
      fontWeight: 400,
      lineHeight: 1.5,
      letterSpacing: '0.00938em',
    },
    body2: {
      fontSize: '0.875rem', // 14px
      fontWeight: 400,
      lineHeight: 1.43,
      letterSpacing: '0.01071em',
    },
    button: {
      fontSize: '0.875rem', // 14px
      fontWeight: 500,
      lineHeight: 1.75,
      letterSpacing: '0.02857em',
      textTransform: 'none', // Material Design 3 doesn't uppercase by default
    },
    caption: {
      fontSize: '0.75rem', // 12px
      fontWeight: 400,
      lineHeight: 1.66,
      letterSpacing: '0.03333em',
    },
  },
  shape: {
    borderRadius: 8, // Material Design 3 default corner radius
  },
  spacing: 8, // 8dp grid system
  shadows: [
    'none',
    '0px 2px 1px -1px rgba(0,0,0,0.2), 0px 1px 1px 0px rgba(0,0,0,0.14), 0px 1px 3px 0px rgba(0,0,0,0.12)', // 1dp
    '0px 3px 1px -2px rgba(0,0,0,0.2), 0px 2px 2px 0px rgba(0,0,0,0.14), 0px 1px 5px 0px rgba(0,0,0,0.12)', // 2dp
    '0px 3px 3px -2px rgba(0,0,0,0.2), 0px 3px 4px 0px rgba(0,0,0,0.14), 0px 1px 8px 0px rgba(0,0,0,0.12)', // 3dp
    '0px 2px 4px -1px rgba(0,0,0,0.2), 0px 4px 5px 0px rgba(0,0,0,0.14), 0px 1px 10px 0px rgba(0,0,0,0.12)', // 4dp
    '0px 3px 5px -1px rgba(0,0,0,0.2), 0px 5px 8px 0px rgba(0,0,0,0.14), 0px 1px 14px 0px rgba(0,0,0,0.12)', // 5dp
    '0px 3px 5px -1px rgba(0,0,0,0.2), 0px 6px 10px 0px rgba(0,0,0,0.14), 0px 1px 18px 0px rgba(0,0,0,0.12)', // 6dp
    '0px 4px 5px -2px rgba(0,0,0,0.2), 0px 7px 10px 1px rgba(0,0,0,0.14), 0px 2px 16px 1px rgba(0,0,0,0.12)', // 7dp
    '0px 5px 5px -3px rgba(0,0,0,0.2), 0px 8px 10px 1px rgba(0,0,0,0.14), 0px 3px 14px 2px rgba(0,0,0,0.12)', // 8dp
    '0px 5px 6px -3px rgba(0,0,0,0.2), 0px 9px 12px 1px rgba(0,0,0,0.14), 0px 3px 16px 2px rgba(0,0,0,0.12)', // 9dp
    '0px 6px 6px -3px rgba(0,0,0,0.2), 0px 10px 14px 1px rgba(0,0,0,0.14), 0px 4px 18px 3px rgba(0,0,0,0.12)', // 10dp
    '0px 6px 7px -4px rgba(0,0,0,0.2), 0px 11px 15px 1px rgba(0,0,0,0.14), 0px 4px 20px 3px rgba(0,0,0,0.12)', // 11dp
    '0px 7px 8px -4px rgba(0,0,0,0.2), 0px 12px 17px 2px rgba(0,0,0,0.14), 0px 5px 22px 4px rgba(0,0,0,0.12)', // 12dp
    '0px 7px 8px -4px rgba(0,0,0,0.2), 0px 13px 19px 2px rgba(0,0,0,0.14), 0px 5px 24px 4px rgba(0,0,0,0.12)', // 13dp
    '0px 7px 9px -4px rgba(0,0,0,0.2), 0px 14px 21px 2px rgba(0,0,0,0.14), 0px 5px 26px 4px rgba(0,0,0,0.12)', // 14dp
    '0px 8px 9px -5px rgba(0,0,0,0.2), 0px 15px 22px 2px rgba(0,0,0,0.14), 0px 6px 28px 5px rgba(0,0,0,0.12)', // 15dp
    '0px 8px 10px -5px rgba(0,0,0,0.2), 0px 16px 24px 2px rgba(0,0,0,0.14), 0px 6px 30px 5px rgba(0,0,0,0.12)', // 16dp
    '0px 8px 11px -5px rgba(0,0,0,0.2), 0px 17px 26px 2px rgba(0,0,0,0.14), 0px 6px 32px 5px rgba(0,0,0,0.12)', // 17dp
    '0px 9px 11px -5px rgba(0,0,0,0.2), 0px 18px 28px 2px rgba(0,0,0,0.14), 0px 7px 34px 6px rgba(0,0,0,0.12)', // 18dp
    '0px 9px 12px -6px rgba(0,0,0,0.2), 0px 19px 29px 2px rgba(0,0,0,0.14), 0px 7px 36px 6px rgba(0,0,0,0.12)', // 19dp
    '0px 10px 13px -6px rgba(0,0,0,0.2), 0px 20px 31px 3px rgba(0,0,0,0.14), 0px 8px 38px 7px rgba(0,0,0,0.12)', // 20dp
    '0px 10px 13px -6px rgba(0,0,0,0.2), 0px 21px 33px 3px rgba(0,0,0,0.14), 0px 8px 40px 7px rgba(0,0,0,0.12)', // 21dp
    '0px 10px 14px -6px rgba(0,0,0,0.2), 0px 22px 35px 3px rgba(0,0,0,0.14), 0px 8px 42px 7px rgba(0,0,0,0.12)', // 22dp
    '0px 11px 14px -7px rgba(0,0,0,0.2), 0px 23px 36px 3px rgba(0,0,0,0.14), 0px 9px 44px 8px rgba(0,0,0,0.12)', // 23dp
    '0px 11px 15px -7px rgba(0,0,0,0.2), 0px 24px 38px 3px rgba(0,0,0,0.14), 0px 9px 46px 8px rgba(0,0,0,0.12)', // 24dp
  ],
  transitions: {
    duration: {
      shortest: 150,
      shorter: 200,
      short: 250,
      standard: 300,
      complex: 375,
      enteringScreen: 225,
      leavingScreen: 195,
    },
    easing: {
      easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
      easeOut: 'cubic-bezier(0.0, 0, 0.2, 1)',
      easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
      sharp: 'cubic-bezier(0.4, 0, 0.6, 1)',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 24, // Material Design 3 pill shape for buttons
          padding: '10px 24px',
          textTransform: 'none', // MD3 doesn't uppercase buttons
        },
        contained: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0px 2px 4px -1px rgba(0,0,0,0.2), 0px 4px 5px 0px rgba(0,0,0,0.14), 0px 1px 10px 0px rgba(0,0,0,0.12)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12, // Material Design 3 card corner radius
          boxShadow: '0px 2px 4px -1px rgba(0,0,0,0.2), 0px 4px 5px 0px rgba(0,0,0,0.14), 0px 1px 10px 0px rgba(0,0,0,0.12)',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        variant: 'outlined',
      },
    },
  },
}

// Create light theme
export const lightTheme = createTheme({
  ...baseTheme,
  palette,
})

// Create dark theme
export const darkTheme = createTheme({
  ...baseTheme,
  palette: darkPalette,
})

// Export default (light) theme
export default lightTheme