'use client'

import { Box } from '@mui/material'
import Typography from '@mui/material/Typography'
import { useTheme } from '@mui/material/styles'

interface LogoProps {
  size?: 'small' | 'medium' | 'large'
  showText?: boolean
  variant?: 'horizontal' | 'vertical'
}

export default function Logo({ 
  size = 'medium', 
  showText = true,
  variant = 'horizontal' 
}: LogoProps) {
  const theme = useTheme()
  
  const sizes = {
    small: { icon: 20, text: 'body2' as const, gap: 0.5, strokeWidth: 2 },
    medium: { icon: 28, text: 'h6' as const, gap: 0.5, strokeWidth: 2.5 },
    large: { icon: 56, text: 'h5' as const, gap: 0.75, strokeWidth: 3 },
  }
  
  const { icon: iconSize, text: textVariant, gap, strokeWidth } = sizes[size]

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap,
        flexDirection: variant === 'vertical' ? 'column' : 'row',
        cursor: 'pointer',
        transition: 'all 0.25s ease',
        transitionDelay: '40ms',
        '&:hover': {
          transform: 'translateY(-1px)',
        },
      }}
    >
      {/* New logo: Two overlapping teal chevrons */}
      <Box
        className="logo-icon"
        sx={{
          position: 'relative',
          width: iconSize * 1.5,
          height: iconSize * 1.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        <svg
          width={iconSize * 1.5}
          height={iconSize * 1.5}
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{
            transition: 'filter 0.25s ease, transform 0.25s ease',
          }}
          className="logo-svg"
        >
          {/* Back chevron (darker teal) - positioned slightly left and behind */}
          <path
            d="M10 24 L18 16 L18 32 Z"
            fill="#36A98C"
            stroke="#36A98C"
            strokeWidth="0.5"
            strokeLinejoin="round"
            style={{
              transition: 'all 0.4s ease',
            }}
          />
          {/* Front chevron (brighter teal) - positioned slightly right and in front */}
          <path
            d="M14 24 L22 16 L22 32 Z"
            fill="#58CBB2"
            stroke="#58CBB2"
            strokeWidth="0.5"
            strokeLinejoin="round"
            style={{
              transition: 'all 0.4s ease',
            }}
          />
        </svg>
      </Box>
      {showText && (
        <Typography
          className="logo-text"
          variant={textVariant}
          component="span"
          sx={{
            fontWeight: 700,
            color: theme.palette.primary.main,
            letterSpacing: '0.02em',
            fontFamily: theme.typography.fontFamily,
            textTransform: 'none',
            fontSize: size === 'large' ? '2rem' : size === 'medium' ? '1.5rem' : '1rem',
            transition: 'color 0.25s ease, text-shadow 0.25s ease, filter 0.25s ease',
            transitionDelay: '40ms',
            '&::first-letter': {
              textTransform: 'uppercase',
            },
          }}
        >
          SwipeHire
        </Typography>
      )}
    </Box>
  )
}