'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useStore } from '@/store/useStore'
import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import Container from '@mui/material/Container'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid2'
import Chip from '@mui/material/Chip'
import { Work, People, ArrowForward, Bolt, Logout } from '@mui/icons-material'
import { useTheme } from '@mui/material/styles'
import Logo from '@/components/Logo'
import { isAuthenticated, logout as authLogout, getUserEmail } from '@/lib/auth'

export default function Home() {
  const theme = useTheme()
  const router = useRouter()
  const { jobs, candidates } = useStore()
  const [isClient, setIsClient] = useState(false)
  const [isAuth, setIsAuth] = useState(false)

  useEffect(() => {
    setIsClient(true)
    const authStatus = isAuthenticated()
    setIsAuth(authStatus)
    
    if (!authStatus) {
      router.push('/landing')
    }
  }, [router])

  const handleLogout = () => {
    authLogout()
    router.push('/landing')
  }

  const totalCandidates = candidates.length

  // Show nothing during SSR and initial client render until auth is checked
  if (!isClient || !isAuth) {
    return null
  }

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <AppBar position="static" elevation={1} sx={{ backgroundColor: 'background.paper', color: 'text.primary' }}>
        <Toolbar sx={{ maxWidth: 'xl', width: '100%', mx: 'auto', justifyContent: 'space-between' }}>
          <Box
            sx={{
              position: 'relative',
              '&:hover .logo-svg': {
                filter: 'drop-shadow(0 0 4px rgba(88, 203, 178, 0.4)) drop-shadow(0 0 10px rgba(88, 203, 178, 0.2)) brightness(1.05)',
              },
              '&:hover .logo-text': {
                color: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.9)' : '#1a1a1a',
                textShadow: '0 0 3px rgba(88, 203, 178, 0.3), 0 0 8px rgba(88, 203, 178, 0.2), 0 0 16px rgba(88, 203, 178, 0.1)',
                filter: 'brightness(1.1)',
              },
            }}
          >
            <Logo size="medium" />
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Button
              variant="text"
              component={Link}
              href="/jobs"
              sx={{ textTransform: 'none' }}
            >
              Jobs
            </Button>
            <Typography variant="body2" color="text.secondary">
              {getUserEmail() || 'admin'}
            </Typography>
            <Button
              variant="outlined"
              size="small"
              startIcon={<Logout />}
              onClick={handleLogout}
            >
              Logout
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Hero Section */}
      <Container maxWidth="lg" sx={{ flex: 1, py: { xs: 4, md: 8 }, px: { xs: 2, sm: 3 } }}>
        <Box 
          sx={{ 
            textAlign: 'center',
            mb: { xs: 5, md: 8 },
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Typography
            variant="h1"
            component="h1"
            sx={{
              fontWeight: 700,
              mb: 3,
              fontSize: { xs: '2.25rem', sm: '3rem', md: '3.75rem' },
              lineHeight: 1.3,
              letterSpacing: '-0.02em',
              color: 'text.primary',
              overflow: 'visible',
            }}
          >
            Stop drowning in resumes.
            <br />
            <Box
              component="span"
              sx={{
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.success.main} 100%)`,
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                display: 'inline-block',
                lineHeight: 1.3,
                overflow: 'visible',
              }}
            >
              Start hiring.
            </Box>
          </Typography>
          <Typography
            variant="body1"
            sx={{
              maxWidth: 580,
              fontSize: { xs: '1rem', md: '1.25rem' },
              color: 'text.secondary',
              lineHeight: 1.7,
              mb: 4,
              mx: 'auto',
            }}
          >
            Swipe through candidate summaries like you're reviewing a deck. 
            Trust your gut. Make decisions in seconds, not hours.
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
            <Button
              variant="contained"
              size="large"
              endIcon={<ArrowForward />}
              onClick={(e) => {
                e.preventDefault()
                try {
                  router.push('/job/new')
                } catch (error) {
                  console.error('Navigation error:', error)
                  window.location.href = '/job/new'
                }
              }}
              sx={{ 
                px: 4, 
                py: 1.75,
                fontSize: '1rem',
                fontWeight: 600,
                textTransform: 'none',
                borderRadius: 3,
                boxShadow: 4,
                '&:hover': {
                  boxShadow: 6,
                  transform: 'translateY(-2px)',
                },
                transition: 'all 0.2s ease',
              }}
            >
              Create Your First Job
            </Button>
            <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
              No credit card required
            </Typography>
          </Box>
        </Box>

        {/* Features */}
        <Grid container spacing={3} sx={{ mb: 6 }}>
          <Grid size={{ xs: 12, md: 4 }}>
            <Card elevation={2} sx={{ height: '100%', '&:hover': { elevation: 4 } }}>
              <CardContent sx={{ p: 3 }}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    backgroundColor: 'primary.light',
                    borderRadius: 1.5,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 2,
                  }}
                >
                  <Work sx={{ color: 'primary.main', fontSize: 24 }} />
                </Box>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                  Quick Job Setup
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Define your role requirements with structured filters in under a minute.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <Card elevation={2} sx={{ height: '100%', '&:hover': { elevation: 4 } }}>
              <CardContent sx={{ p: 3 }}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    backgroundColor: 'success.light',
                    borderRadius: 1.5,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 2,
                  }}
                >
                  <Bolt sx={{ color: 'success.main', fontSize: 24 }} />
                </Box>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                  AI-Powered Summaries
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Each candidate is summarized into high-signal cards with key strengths highlighted.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <Card elevation={2} sx={{ height: '100%', '&:hover': { elevation: 4 } }}>
              <CardContent sx={{ p: 3 }}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    backgroundColor: 'warning.light',
                    borderRadius: 1.5,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 2,
                  }}
                >
                  <People sx={{ color: 'warning.main', fontSize: 24 }} />
                </Box>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                  Swipe to Decide
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Make quick yes/no decisions with intuitive swipe gestures on mobile or desktop.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Action Buttons */}
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 6 }}>
          <Button
            component={Link}
            href="/job/new"
            variant="contained"
            size="large"
            endIcon={<ArrowForward />}
            sx={{ 
              px: 4, 
              py: 1.5,
              transition: 'all 0.2s ease-in-out',
              textDecoration: 'none',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: 4,
              },
            }}
          >
            Create New Job
          </Button>
        </Box>

        {/* Quick Access to Jobs */}
        <Box sx={{ mt: 6 }}>
          <Card elevation={2} sx={{ p: 4, borderRadius: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
                  Manage Your Jobs
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {jobs.length > 0 
                    ? `You have ${jobs.length} active ${jobs.length === 1 ? 'job' : 'jobs'} and ${totalCandidates} total candidates`
                    : 'Create and manage your job postings'}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                {jobs.length > 0 && (
                  <Button
                    variant="outlined"
                    size="large"
                    component={Link}
                    href="/jobs"
                    startIcon={<Work />}
                    sx={{ textTransform: 'none' }}
                  >
                    View All Jobs
                  </Button>
                )}
                <Button
                  variant="contained"
                  size="large"
                  component={Link}
                  href="/job/new"
                  startIcon={<ArrowForward />}
                  sx={{ textTransform: 'none' }}
                >
                  {jobs.length > 0 ? 'Create New Job' : 'Create Your First Job'}
                </Button>
              </Box>
            </Box>
          </Card>
        </Box>
      </Container>
    </Box>
  )
}