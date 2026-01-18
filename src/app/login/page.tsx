'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import Container from '@mui/material/Container'
import Paper from '@mui/material/Paper'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Alert from '@mui/material/Alert'
import InputAdornment from '@mui/material/InputAdornment'
import IconButton from '@mui/material/IconButton'
import { Login, Visibility, VisibilityOff, Person, Lock } from '@mui/icons-material'
import Logo from '@/components/Logo'

// Default credentials
const DEFAULT_EMAIL = 'admin'
const DEFAULT_PASSWORD = 'swipehire'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    // Check credentials
    if (email === DEFAULT_EMAIL && password === DEFAULT_PASSWORD) {
      // Store auth in sessionStorage
      sessionStorage.setItem('isAuthenticated', 'true')
      sessionStorage.setItem('userEmail', email)
      sessionStorage.setItem('username', email)
      
      // Redirect to home page
      router.push('/')
      router.refresh()
    } else {
      setError('Invalid email or password')
      setIsLoading(false)
    }
  }

  const handleQuickLogin = () => {
    setEmail(DEFAULT_EMAIL)
    setPassword(DEFAULT_PASSWORD)
    setError('')
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'background.default',
      }}
    >
      {/* Header */}
      <AppBar position="static" elevation={0} sx={{ backgroundColor: 'background.paper' }}>
        <Toolbar sx={{ maxWidth: 'md', width: '100%', mx: 'auto', px: { xs: 2, sm: 3 } }}>
          <Logo size="medium" />
        </Toolbar>
      </AppBar>

      {/* Login Form */}
      <Container
        maxWidth="sm"
        sx={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          py: 4,
          px: { xs: 2, sm: 3 },
        }}
      >
        <Paper
          elevation={4}
          sx={{
            width: '100%',
            p: { xs: 3, sm: 4 },
            borderRadius: 2,
          }}
        >
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Box
              sx={{
                width: 64,
                height: 64,
                backgroundColor: 'primary.main',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 2,
              }}
            >
              <Login sx={{ color: 'white', fontSize: 32 }} />
            </Box>
            <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 600 }}>
              Welcome Back
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Sign in to access SwipeHire
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              fullWidth
              required
              label="Username"
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your username"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Person color="action" />
                  </InputAdornment>
                ),
              }}
              disabled={isLoading}
            />

            <TextField
              fullWidth
              required
              label="Password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock color="action" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                      disabled={isLoading}
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              disabled={isLoading}
            />

            <Button
              type="submit"
              variant="contained"
              size="large"
              fullWidth
              disabled={isLoading || !email || !password}
              sx={{ mt: 1, py: 1.5 }}
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>

            <Box
              sx={{
                mt: 2,
                p: 2,
                backgroundColor: 'action.hover',
                borderRadius: 1,
                border: 1,
                borderColor: 'divider',
              }}
            >
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                Demo Credentials:
              </Typography>
              <Typography variant="body2" sx={{ fontFamily: 'monospace', mb: 0.5 }}>
                Username: {DEFAULT_EMAIL}
              </Typography>
              <Typography variant="body2" sx={{ fontFamily: 'monospace', mb: 1.5 }}>
                Password: {DEFAULT_PASSWORD}
              </Typography>
              <Button
                variant="outlined"
                size="small"
                fullWidth
                onClick={handleQuickLogin}
                disabled={isLoading}
              >
                Use Demo Credentials
              </Button>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  )
}
