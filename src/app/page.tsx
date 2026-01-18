'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useStore } from '@/store/useStore'
import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import Container from '@mui/material/Container'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardActionArea from '@mui/material/CardActionArea'
import CardActions from '@mui/material/CardActions'
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid2'
import IconButton from '@mui/material/IconButton'
import Chip from '@mui/material/Chip'
import Divider from '@mui/material/Divider'
import TextField from '@mui/material/TextField'
import Alert from '@mui/material/Alert'
import Collapse from '@mui/material/Collapse'
import { Work, People, ArrowForward, Bolt, Logout, Delete, AccessTime, Cancel, CheckCircle } from '@mui/icons-material'
import Logo from '@/components/Logo'
import { isAuthenticated, logout as authLogout, getUserEmail } from '@/lib/auth'

export default function Home() {
  const router = useRouter()
  const { jobs, setCurrentJob, deleteJob, deleteAllJobs, candidates } = useStore()
  const [jobToDelete, setJobToDelete] = useState<string | null>(null)
  const [showDeleteAll, setShowDeleteAll] = useState(false)
  const [deleteAllConfirmText, setDeleteAllConfirmText] = useState('')
  const [isClient, setIsClient] = useState(false)
  const [isAuth, setIsAuth] = useState(false)

  useEffect(() => {
    setIsClient(true)
    const authStatus = isAuthenticated()
    setIsAuth(authStatus)
    
    if (!authStatus) {
      router.push('/login')
    }
  }, [router])

  const handleLogout = () => {
    authLogout()
    router.push('/login')
  }

  const handleDeleteJob = (jobId: string) => {
    deleteJob(jobId)
    setJobToDelete(null)
    // If no jobs left, stay on home page (which will show empty state)
  }

  const handleStartDeleteJob = (jobId: string) => {
    setJobToDelete(jobId)
  }

  const handleDeleteAllConfirm = () => {
    if (deleteAllConfirmText.toLowerCase() === 'delete all') {
      deleteAllJobs()
      setShowDeleteAll(false)
      setDeleteAllConfirmText('')
      router.push('/')
    }
  }

  const handleCancelDelete = () => {
    setJobToDelete(null)
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
          <Logo size="medium" />
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
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
      <Container maxWidth="lg" sx={{ flex: 1, py: 6, px: { xs: 2, sm: 3 } }}>
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography
            variant="h2"
            component="h1"
            gutterBottom
            sx={{
              fontWeight: 500,
              mb: 2,
              fontSize: { xs: '2.5rem', md: '3rem' },
            }}
          >
            Screen Candidates in Minutes,
            <br />
            Not Hours
          </Typography>
          <Typography
            variant="body1"
            sx={{
              maxWidth: 600,
              mx: 'auto',
              fontSize: '1.125rem',
              color: 'text.secondary',
            }}
          >
            AI-powered candidate cards let you make quick, instinct-driven hiring decisions
            with a simple swipe interface.
          </Typography>
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
            sx={{ px: 4, py: 1.5 }}
          >
            Create New Job
          </Button>
        </Box>

        {/* Delete All Jobs Confirmation */}
        {jobs.length > 0 && (
          <Collapse in={showDeleteAll}>
            <Alert
              severity="error"
              sx={{ mb: 3 }}
              action={
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                  <TextField
                    size="small"
                    placeholder="Type 'delete all'"
                    value={deleteAllConfirmText}
                    onChange={(e) => setDeleteAllConfirmText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && deleteAllConfirmText.toLowerCase() === 'delete all') {
                        handleDeleteAllConfirm()
                      }
                    }}
                    sx={{ width: 150 }}
                  />
                  <Button
                    size="small"
                    color="error"
                    variant="contained"
                    disabled={deleteAllConfirmText.toLowerCase() !== 'delete all'}
                    onClick={handleDeleteAllConfirm}
                    startIcon={<CheckCircle />}
                  >
                    Confirm
                  </Button>
                  <Button
                    size="small"
                    onClick={() => {
                      setShowDeleteAll(false)
                      setDeleteAllConfirmText('')
                    }}
                    startIcon={<Cancel />}
                  >
                    Cancel
                  </Button>
                </Box>
              }
            >
              <Typography variant="body2" fontWeight={600} gutterBottom>
                Delete All Jobs
              </Typography>
              <Typography variant="body2">
                This will permanently delete all {jobs.length} job{jobs.length === 1 ? '' : 's'} and {totalCandidates} candidate{totalCandidates === 1 ? '' : 's'}. 
                Type <strong>"delete all"</strong> to confirm.
              </Typography>
            </Alert>
          </Collapse>
        )}

        {/* Existing Jobs */}
        {jobs.length > 0 ? (
          <Card elevation={2} sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Your Jobs ({jobs.length})
              </Typography>
              <Button
                variant="outlined"
                color="error"
                size="small"
                startIcon={<Delete />}
                onClick={() => setShowDeleteAll(!showDeleteAll)}
              >
                Delete All Jobs
              </Button>
            </Box>
            <Grid container spacing={2}>
              {jobs.map((job) => {
                const jobCandidates = candidates.filter(c => c.jobId === job.id)
                const pendingCount = jobCandidates.filter(c => c.status === 'pending').length
                const interestedCount = jobCandidates.filter(c => c.status === 'interested').length
                const starredCount = jobCandidates.filter(c => c.status === 'starred').length
                const totalJobCandidates = jobCandidates.length
                const isConfirmingDelete = jobToDelete === job.id

                return (
                  <Grid size={{ xs: 12, sm: 6, md: 4 }} key={job.id}>
                    <Card 
                      elevation={isConfirmingDelete ? 8 : 2} 
                      sx={{ 
                        height: '100%', 
                        display: 'flex', 
                        flexDirection: 'column',
                        border: isConfirmingDelete ? 2 : 0,
                        borderColor: isConfirmingDelete ? 'error.main' : 'transparent',
                      }}
                    >
                      <CardActionArea
                        onClick={() => {
                          if (!isConfirmingDelete) {
                            setCurrentJob(job)
                            router.push(`/job/${job.id}/swipe`)
                          }
                        }}
                        disabled={isConfirmingDelete}
                        sx={{ flex: 1, p: 2, display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}
                      >
                        {isConfirmingDelete ? (
                          <Box sx={{ width: '100%', p: 2 }}>
                            <Alert severity="error" sx={{ mb: 2 }}>
                              <Typography variant="body2" fontWeight={600} gutterBottom>
                                Delete "{job.title}"?
                              </Typography>
                              <Typography variant="body2">
                                This will delete {totalJobCandidates} associated candidate{totalJobCandidates === 1 ? '' : 's'}. This action cannot be undone.
                              </Typography>
                            </Alert>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                              <Button
                                variant="contained"
                                color="error"
                                size="small"
                                fullWidth
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleDeleteJob(job.id)
                                }}
                                startIcon={<CheckCircle />}
                              >
                                Confirm Delete
                              </Button>
                              <Button
                                variant="outlined"
                                size="small"
                                fullWidth
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleCancelDelete()
                                }}
                                startIcon={<Cancel />}
                              >
                                Cancel
                              </Button>
                            </Box>
                          </Box>
                        ) : (
                          <>
                            <Box sx={{ width: '100%', mb: 1.5 }}>
                              <Typography variant="h6" component="h3" sx={{ fontWeight: 600, mb: 0.5 }}>
                                {job.title}
                              </Typography>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                                <AccessTime sx={{ fontSize: 14, color: 'text.secondary' }} />
                                <Typography variant="caption" color="text.secondary">
                                  {new Date(job.createdAt).toLocaleDateString()}
                                </Typography>
                              </Box>
                            </Box>

                            {job.techStack.length > 0 && (
                              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1.5, width: '100%' }}>
                                {job.techStack.slice(0, 3).map((tech) => (
                                  <Chip key={tech} label={tech} size="small" variant="outlined" />
                                ))}
                                {job.techStack.length > 3 && (
                                  <Chip label={`+${job.techStack.length - 3}`} size="small" variant="outlined" />
                                )}
                              </Box>
                            )}

                            {totalJobCandidates > 0 && (
                              <Box sx={{ width: '100%', mt: 'auto' }}>
                                <Divider sx={{ my: 1 }} />
                                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                  {pendingCount > 0 && (
                                    <Chip
                                      label={`${pendingCount} Pending`}
                                      size="small"
                                      sx={{ backgroundColor: 'action.hover' }}
                                    />
                                  )}
                                  {interestedCount > 0 && (
                                    <Chip
                                      label={`${interestedCount} Interested`}
                                      size="small"
                                      color="success"
                                      variant="outlined"
                                    />
                                  )}
                                  {starredCount > 0 && (
                                    <Chip
                                      label={`${starredCount} Starred`}
                                      size="small"
                                      color="warning"
                                      variant="outlined"
                                    />
                                  )}
                                </Box>
                              </Box>
                            )}
                          </>
                        )}
                      </CardActionArea>
                      {!isConfirmingDelete && (
                        <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 1 }}>
                          <Typography variant="caption" color="text.secondary">
                            {totalJobCandidates} {totalJobCandidates === 1 ? 'candidate' : 'candidates'}
                          </Typography>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleStartDeleteJob(job.id)
                            }}
                            aria-label="Delete job"
                          >
                            <Delete fontSize="small" />
                          </IconButton>
                        </CardActions>
                      )}
                    </Card>
                  </Grid>
                )
              })}
            </Grid>
          </Card>
        ) : (
          <Card elevation={2} sx={{ p: 4, textAlign: 'center' }}>
            <Work sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              No Jobs Yet
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Create your first job posting to start screening candidates
            </Typography>
            <Button
              variant="contained"
              size="large"
              endIcon={<ArrowForward />}
              onClick={() => router.push('/job/new')}
            >
              Create Your First Job
            </Button>
          </Card>
        )}
      </Container>
    </Box>
  )
}