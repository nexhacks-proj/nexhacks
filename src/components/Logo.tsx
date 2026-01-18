'use client'

import { Box } from '@mui/material'
import { Bolt } from '@mui/icons-material'
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
    small: { icon: 20, text: 'body2' as const, gap: 0.75 },
    medium: { icon: 24, text: 'h6' as const, gap: 1 },
    large: { icon: 32, text: 'h5' as const, gap: 1.25 },
  }
  
  const { icon: iconSize, text: textVariant, gap } = sizes[size]

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap,
        flexDirection: variant === 'vertical' ? 'column' : 'row',
      }}
    >
      <Box
        sx={{
          width: iconSize * 1.5,
          height: iconSize * 1.5,
          backgroundColor: 'primary.main',
          borderRadius: 1.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: theme.shadows[2],
        }}
      >
        <Bolt 
          sx={{ 
            color: 'white', 
            fontSize: iconSize,
          }} 
        />
      </Box>
      {showText && (
        <Typography
          variant={textVariant}
          component="span"
          sx={{
            fontWeight: 700,
            background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            letterSpacing: '-0.02em',
          }}
        >
          SwipeHire
        </Typography>
      )}
    </Box>
  )
}