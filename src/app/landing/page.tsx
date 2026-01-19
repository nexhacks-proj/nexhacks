'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Grid from '@mui/material/Grid2'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import { ArrowForward, Work, People, AutoAwesome, Speed } from '@mui/icons-material'
import { useTheme } from '@mui/material/styles'
import Logo from '@/components/Logo'

export default function LandingPage() {
  const router = useRouter()
  const theme = useTheme()

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box
        sx={{
          backgroundColor: 'background.paper',
          borderBottom: 1,
          borderColor: 'divider',
          py: 2,
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Logo size="medium" />
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="outlined"
                onClick={() => router.push('/login')}
                sx={{ textTransform: 'none' }}
              >
                Sign In
              </Button>
              <Button
                variant="contained"
                onClick={() => router.push('/login')}
                sx={{ textTransform: 'none' }}
              >
                Get Started
              </Button>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Hero Section */}
      <Box sx={{ flex: 1, py: { xs: 6, md: 12 } }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Typography
              variant="h1"
              sx={{
                fontWeight: 700,
                fontSize: { xs: '2.5rem', sm: '3.5rem', md: '4.5rem' },
                mb: 3,
                lineHeight: 1.2,
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.success.main} 100%)`,
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Screen Candidates in Minutes,
              <br />
              Not Hours
            </Typography>
            <Typography
              variant="h5"
              color="text.secondary"
              sx={{
                maxWidth: 700,
                mx: 'auto',
                mb: 4,
                fontWeight: 400,
                lineHeight: 1.6,
              }}
            >
              AI-powered candidate cards let you make quick, instinct-driven hiring decisions
              with a simple swipe interface.
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                size="large"
                endIcon={<ArrowForward />}
                onClick={() => router.push('/login')}
                sx={{
                  px: 4,
                  py: 1.5,
                  fontSize: '1.1rem',
                  textTransform: 'none',
                  borderRadius: 3,
                }}
              >
                Get Started Free
              </Button>
              <Button
                variant="outlined"
                size="large"
                onClick={() => router.push('/login')}
                sx={{
                  px: 4,
                  py: 1.5,
                  fontSize: '1.1rem',
                  textTransform: 'none',
                  borderRadius: 3,
                }}
              >
                Sign In
              </Button>
            </Box>
          </Box>

          {/* Features */}
          <Grid container spacing={4} sx={{ mt: 8 }}>
            <Grid size={{ xs: 12, md: 4 }}>
              <Card elevation={2} sx={{ height: '100%', '&:hover': { elevation: 4, transform: 'translateY(-4px)' }, transition: 'all 0.3s' }}>
                <CardContent sx={{ p: 4 }}>
                  <Box
                    sx={{
                      width: 64,
                      height: 64,
                      backgroundColor: 'primary.light',
                      borderRadius: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mb: 3,
                    }}
                  >
                    <Speed sx={{ color: 'primary.main', fontSize: 32 }} />
                  </Box>
                  <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
                    Lightning Fast
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Review candidates in seconds with intuitive swipe gestures. Make decisions faster than ever.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <Card elevation={2} sx={{ height: '100%', '&:hover': { elevation: 4, transform: 'translateY(-4px)' }, transition: 'all 0.3s' }}>
                <CardContent sx={{ p: 4 }}>
                  <Box
                    sx={{
                      width: 64,
                      height: 64,
                      backgroundColor: 'success.light',
                      borderRadius: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mb: 3,
                    }}
                  >
                    <AutoAwesome sx={{ color: 'success.main', fontSize: 32 }} />
                  </Box>
                  <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
                    AI-Powered
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Smart candidate summaries and automatic skill extraction. Focus on what matters most.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <Card elevation={2} sx={{ height: '100%', '&:hover': { elevation: 4, transform: 'translateY(-4px)' }, transition: 'all 0.3s' }}>
                <CardContent sx={{ p: 4 }}>
                  <Box
                    sx={{
                      width: 64,
                      height: 64,
                      backgroundColor: 'warning.light',
                      borderRadius: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mb: 3,
                    }}
                  >
                    <People sx={{ color: 'warning.main', fontSize: 32 }} />
                  </Box>
                  <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
                    Built for Startups
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Designed for fast-growing teams who need to hire quickly without sacrificing quality.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Footer */}
      <Box
        sx={{
          backgroundColor: 'background.paper',
          borderTop: 1,
          borderColor: 'divider',
          py: 4,
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
            <Typography variant="body2" color="text.secondary">
              © 2024 SwipeHire. All rights reserved.
            </Typography>
            <Box sx={{ display: 'flex', gap: 3 }}>
              <Button variant="text" size="small" sx={{ textTransform: 'none' }}>
                Privacy
              </Button>
              <Button variant="text" size="small" sx={{ textTransform: 'none' }}>
                Terms
              </Button>
              <Button variant="text" size="small" sx={{ textTransform: 'none' }}>
                Contact
              </Button>
            </Box>
          </Box>
        </Container>
      </Box>
    </Box>
  )
}
