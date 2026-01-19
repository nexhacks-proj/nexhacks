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
import CardActions from '@mui/material/CardActions'
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid2'
import IconButton from '@mui/material/IconButton'
import Chip from '@mui/material/Chip'
import Divider from '@mui/material/Divider'
import TextField from '@mui/material/TextField'
import Alert from '@mui/material/Alert'
import Collapse from '@mui/material/Collapse'
import InputAdornment from '@mui/material/InputAdornment'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Paper from '@mui/material/Paper'
import { 
  Work, 
  ArrowForward, 
  Logout, 
  Delete, 
  AccessTime, 
  Cancel, 
  CheckCircle,
  Search,
  FilterList,
  Sort,
  People,
  Star,
  CheckCircle as CheckCircleIcon,
  Close,
  Edit,
  ContentCopy,
  Dashboard,
  PlayArrow,
  MoreVert,
  TrendingUp,
  School,
  Code as CodeIcon,
} from '@mui/icons-material'
import { useTheme } from '@mui/material/styles'
import CircularProgress from '@mui/material/CircularProgress'
import Logo from '@/components/Logo'
import { isAuthenticated, logout as authLogout, getUserEmail } from '@/lib/auth'
import { Job } from '@/types'

type SortOption = 'newest' | 'oldest' | 'most-candidates' | 'title'

export default function JobsPage() {
  const theme = useTheme()
  const router = useRouter()
  const { jobs, setCurrentJob, deleteJob, deleteAllJobs, candidates } = useStore()
  const [jobToDelete, setJobToDelete] = useState<string | null>(null)
  const [showDeleteAll, setShowDeleteAll] = useState(false)
  const [deleteAllConfirmText, setDeleteAllConfirmText] = useState('')
  const [isClient, setIsClient] = useState(false)
  const [isAuth, setIsAuth] = useState(false)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const [isDeletingAll, setIsDeletingAll] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<SortOption>('newest')

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

  const handleDeleteJob = (jobId: string) => {
    setIsDeleting(jobId)
    setTimeout(() => {
      deleteJob(jobId)
      setJobToDelete(null)
      setIsDeleting(null)
    }, 150)
  }

  const handleStartDeleteJob = (jobId: string) => {
    setJobToDelete(jobId)
  }

  const handleDeleteAllConfirm = () => {
    if (deleteAllConfirmText.toLowerCase() === 'delete all') {
      setIsDeletingAll(true)
      setTimeout(() => {
        deleteAllJobs()
        setShowDeleteAll(false)
        setDeleteAllConfirmText('')
        setIsDeletingAll(false)
      }, 200)
    }
  }

  const handleCancelDelete = () => {
    setJobToDelete(null)
  }

  // Filter and sort jobs
  const filteredAndSortedJobs = jobs
    .filter((job) => {
      if (!searchQuery) return true
      const query = searchQuery.toLowerCase()
      return (
        job.title.toLowerCase().includes(query) ||
        job.techStack.some((tech) => tech.toLowerCase().includes(query)) ||
        job.description?.toLowerCase().includes(query)
      )
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        case 'most-candidates': {
          const aCount = candidates.filter((c) => c.jobId === a.id).length
          const bCount = candidates.filter((c) => c.jobId === b.id).length
          return bCount - aCount
        }
        case 'title':
          return a.title.localeCompare(b.title)
        default:
          return 0
      }
    })

  const totalCandidates = candidates.length
  const totalJobs = jobs.length

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
              href="/"
              sx={{ textTransform: 'none' }}
            >
              Dashboard
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

      <Container maxWidth="xl" sx={{ flex: 1, py: 4, px: { xs: 2, sm: 3 } }}>
        {/* Page Header */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3, flexWrap: 'wrap', gap: 2 }}>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                Your Jobs
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Manage and track all your job postings
              </Typography>
            </Box>
            <Button
              variant="contained"
              size="large"
              component={Link}
              href="/job/new"
              startIcon={<Work />}
              sx={{
                textTransform: 'none',
                px: 3,
                py: 1.5,
              }}
            >
              Create New Job
            </Button>
          </Box>

          {/* Stats Cards */}
          <Grid container spacing={2} sx={{ mb: 4 }}>
            <Grid size={{ xs: 6, sm: 3 }}>
              <Paper elevation={2} sx={{ p: 2, borderRadius: 2 }}>
                <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main' }}>
                  {totalJobs}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Active Jobs
                </Typography>
              </Paper>
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
              <Paper elevation={2} sx={{ p: 2, borderRadius: 2 }}>
                <Typography variant="h4" sx={{ fontWeight: 700, color: 'success.main' }}>
                  {totalCandidates}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Candidates
                </Typography>
              </Paper>
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
              <Paper elevation={2} sx={{ p: 2, borderRadius: 2 }}>
                <Typography variant="h4" sx={{ fontWeight: 700, color: 'warning.main' }}>
                  {candidates.filter((c) => c.status === 'pending').length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Pending Review
                </Typography>
              </Paper>
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
              <Paper elevation={2} sx={{ p: 2, borderRadius: 2 }}>
                <Typography variant="h4" sx={{ fontWeight: 700, color: 'info.main' }}>
                  {candidates.filter((c) => c.status === 'interested').length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Interested
                </Typography>
              </Paper>
            </Grid>
          </Grid>

          {/* Search and Filter Bar */}
          <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
            <TextField
              placeholder="Search jobs by title, tech stack, or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search color="action" />
                  </InputAdornment>
                ),
              }}
              sx={{ flex: 1, minWidth: 250 }}
            />
            <FormControl sx={{ minWidth: 180 }}>
              <InputLabel>Sort By</InputLabel>
              <Select
                value={sortBy}
                label="Sort By"
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                startAdornment={<Sort sx={{ mr: 1, color: 'text.secondary' }} />}
              >
                <MenuItem value="newest">Newest First</MenuItem>
                <MenuItem value="oldest">Oldest First</MenuItem>
                <MenuItem value="most-candidates">Most Candidates</MenuItem>
                <MenuItem value="title">Title (A-Z)</MenuItem>
              </Select>
            </FormControl>
          </Box>

          {/* Delete All Confirmation */}
          {showDeleteAll && (
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
                      disabled={deleteAllConfirmText.toLowerCase() !== 'delete all' || isDeletingAll}
                      onClick={handleDeleteAllConfirm}
                      startIcon={isDeletingAll ? <CircularProgress size={16} color="inherit" /> : <CheckCircle />}
                    >
                      {isDeletingAll ? 'Deleting...' : 'Confirm'}
                    </Button>
                    <Button
                      size="small"
                      onClick={() => {
                        setShowDeleteAll(false)
                        setDeleteAllConfirmText('')
                      }}
                      startIcon={<Cancel />}
                      disabled={isDeletingAll}
                    >
                      Cancel
                    </Button>
                  </Box>
                }
              >
                <Typography variant="body2" fontWeight={600} gutterBottom>
                  Delete All Jobs?
                </Typography>
                <Typography variant="body2">
                  This will permanently delete all {totalJobs} jobs and {totalCandidates} candidates. This action cannot be undone.
                </Typography>
              </Alert>
            </Collapse>
          )}
        </Box>

        {/* Jobs List */}
        {filteredAndSortedJobs.length > 0 ? (
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="body2" color="text.secondary">
                Showing {filteredAndSortedJobs.length} of {totalJobs} jobs
              </Typography>
              {totalJobs > 0 && (
                <Button
                  variant="outlined"
                  color="error"
                  size="small"
                  startIcon={<Delete />}
                  onClick={() => setShowDeleteAll(!showDeleteAll)}
                >
                  Delete All
                </Button>
              )}
            </Box>
            <Grid container spacing={3}>
              {filteredAndSortedJobs.map((job) => {
                const jobCandidates = candidates.filter((c) => c.jobId === job.id)
                const pendingCount = jobCandidates.filter((c) => c.status === 'pending').length
                const interestedCount = jobCandidates.filter((c) => c.status === 'interested').length
                const rejectedCount = jobCandidates.filter((c) => c.status === 'rejected').length
                const starredCount = jobCandidates.filter((c) => c.status === 'starred').length
                const totalJobCandidates = jobCandidates.length
                const isConfirmingDelete = jobToDelete === job.id

                return (
                  <Grid size={{ xs: 12, md: 6, lg: 4 }} key={job.id}>
                    <Card
                      elevation={isConfirmingDelete ? 8 : 2}
                      sx={{
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        border: isConfirmingDelete ? 2 : 0,
                        borderColor: isConfirmingDelete ? 'error.main' : 'transparent',
                        position: 'relative',
                        overflow: 'visible',
                        transition: 'all 0.2s ease-in-out',
                        '&:hover': {
                          elevation: isConfirmingDelete ? 8 : 4,
                          transform: isConfirmingDelete ? 'none' : 'translateY(-2px)',
                        },
                      }}
                    >
                      {isConfirmingDelete ? (
                        <CardContent sx={{ p: 3 }}>
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
                                e.preventDefault()
                                e.stopPropagation()
                                handleDeleteJob(job.id)
                              }}
                              disabled={isDeleting === job.id}
                              startIcon={isDeleting === job.id ? <CircularProgress size={16} color="inherit" /> : <CheckCircle />}
                            >
                              {isDeleting === job.id ? 'Deleting...' : 'Confirm Delete'}
                            </Button>
                            <Button
                              variant="outlined"
                              size="small"
                              fullWidth
                              onClick={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                handleCancelDelete()
                              }}
                              startIcon={<Cancel />}
                              disabled={isDeleting === job.id}
                            >
                              Cancel
                            </Button>
                          </Box>
                        </CardContent>
                      ) : (
                        <>
                          <CardContent
                            sx={{
                              flex: 1,
                              p: 3,
                              cursor: 'pointer',
                              '&:hover': {
                                backgroundColor: 'action.hover',
                              },
                            }}
                            onClick={() => {
                              setCurrentJob(job)
                              router.push(`/job/${job.id}/swipe`)
                            }}
                          >
                            {/* Job Title and Date */}
                            <Box sx={{ mb: 2 }}>
                              <Typography variant="h6" component="h3" sx={{ fontWeight: 600, mb: 1 }}>
                                {job.title}
                              </Typography>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                                <AccessTime sx={{ fontSize: 14, color: 'text.secondary' }} />
                                <Typography variant="caption" color="text.secondary">
                                  Created {new Date(job.createdAt).toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric',
                                  })}
                                </Typography>
                              </Box>
                            </Box>

                            {/* Experience Level */}
                            {job.experienceLevel && (
                              <Box sx={{ mb: 2 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                                  <School sx={{ fontSize: 14, color: 'text.secondary' }} />
                                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                                    Experience Level:
                                  </Typography>
                                </Box>
                                <Chip
                                  label={
                                    job.experienceLevel === 'none'
                                      ? 'Entry Level (0 years)'
                                      : job.experienceLevel === '1-3'
                                      ? 'Mid Level (1-3 years)'
                                      : 'Senior (3+ years)'
                                  }
                                  size="small"
                                  sx={{ backgroundColor: 'primary.light', color: 'primary.contrastText' }}
                                />
                              </Box>
                            )}

                            {/* Tech Stack */}
                            {job.techStack.length > 0 && (
                              <Box sx={{ mb: 2 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                                  <CodeIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                                    Tech Stack ({job.techStack.length}):
                                  </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                  {job.techStack.slice(0, 6).map((tech) => (
                                    <Chip key={tech} label={tech} size="small" variant="outlined" />
                                  ))}
                                  {job.techStack.length > 6 && (
                                    <Chip label={`+${job.techStack.length - 6} more`} size="small" variant="outlined" />
                                  )}
                                </Box>
                              </Box>
                            )}

                            {/* Job Preferences */}
                            <Box sx={{ mb: 2 }}>
                              {(job.visaSponsorship || job.startupExperiencePreferred || job.portfolioRequired) && (
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                  {job.visaSponsorship && (
                                    <Chip label="Visa Sponsorship" size="small" color="info" variant="outlined" />
                                  )}
                                  {job.startupExperiencePreferred && (
                                    <Chip label="Startup Experience" size="small" color="success" variant="outlined" />
                                  )}
                                  {job.portfolioRequired && (
                                    <Chip label="Portfolio Required" size="small" color="warning" variant="outlined" />
                                  )}
                                </Box>
                              )}
                            </Box>

                            <Divider sx={{ my: 2 }} />

                            {/* Candidate Stats */}
                            {totalJobCandidates > 0 ? (
                              <Box>
                                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, mb: 1, display: 'block' }}>
                                  Candidate Statistics
                                </Typography>
                                <Grid container spacing={1}>
                                  <Grid size={6}>
                                    <Paper
                                      elevation={0}
                                      sx={{
                                        p: 1,
                                        backgroundColor: 'action.hover',
                                        textAlign: 'center',
                                        borderRadius: 1,
                                      }}
                                    >
                                      <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary' }}>
                                        {totalJobCandidates}
                                      </Typography>
                                      <Typography variant="caption" color="text.secondary">
                                        Total
                                      </Typography>
                                    </Paper>
                                  </Grid>
                                  {pendingCount > 0 && (
                                    <Grid size={6}>
                                      <Paper
                                        elevation={0}
                                        sx={{
                                          p: 1,
                                          backgroundColor: 'action.hover',
                                          textAlign: 'center',
                                          borderRadius: 1,
                                        }}
                                      >
                                        <Typography variant="h6" sx={{ fontWeight: 700, color: 'warning.main' }}>
                                          {pendingCount}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                          Pending
                                        </Typography>
                                      </Paper>
                                    </Grid>
                                  )}
                                  {interestedCount > 0 && (
                                    <Grid size={6}>
                                      <Paper
                                        elevation={0}
                                        sx={{
                                          p: 1,
                                          backgroundColor: 'success.light',
                                          textAlign: 'center',
                                          borderRadius: 1,
                                        }}
                                      >
                                        <Typography variant="h6" sx={{ fontWeight: 700, color: 'success.main' }}>
                                          {interestedCount}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                          Interested
                                        </Typography>
                                      </Paper>
                                    </Grid>
                                  )}
                                  {starredCount > 0 && (
                                    <Grid size={6}>
                                      <Paper
                                        elevation={0}
                                        sx={{
                                          p: 1,
                                          backgroundColor: 'warning.light',
                                          textAlign: 'center',
                                          borderRadius: 1,
                                        }}
                                      >
                                        <Typography variant="h6" sx={{ fontWeight: 700, color: 'warning.main' }}>
                                          {starredCount}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                          Starred
                                        </Typography>
                                      </Paper>
                                    </Grid>
                                  )}
                                  {rejectedCount > 0 && (
                                    <Grid size={6}>
                                      <Paper
                                        elevation={0}
                                        sx={{
                                          p: 1,
                                          backgroundColor: 'error.light',
                                          textAlign: 'center',
                                          borderRadius: 1,
                                        }}
                                      >
                                        <Typography variant="h6" sx={{ fontWeight: 700, color: 'error.main' }}>
                                          {rejectedCount}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                          Rejected
                                        </Typography>
                                      </Paper>
                                    </Grid>
                                  )}
                                </Grid>
                              </Box>
                            ) : (
                              <Box sx={{ textAlign: 'center', py: 2 }}>
                                <People sx={{ fontSize: 32, color: 'text.secondary', mb: 1 }} />
                                <Typography variant="body2" color="text.secondary">
                                  No candidates yet
                                </Typography>
                              </Box>
                            )}
                          </CardContent>

                          <CardActions
                            sx={{
                              justifyContent: 'space-between',
                              px: 2,
                              pb: 2,
                              pt: 1,
                              borderTop: 1,
                              borderColor: 'divider',
                            }}
                          >
                            <Box sx={{ display: 'flex', gap: 1 }}>
                              <Button
                                size="small"
                                variant="contained"
                                startIcon={<PlayArrow />}
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setCurrentJob(job)
                                  router.push(`/job/${job.id}/swipe`)
                                }}
                                sx={{ textTransform: 'none' }}
                              >
                                Review
                              </Button>
                              <Button
                                size="small"
                                variant="outlined"
                                startIcon={<Dashboard />}
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setCurrentJob(job)
                                  router.push(`/job/${job.id}/dashboard`)
                                }}
                                sx={{ textTransform: 'none' }}
                              >
                                Dashboard
                              </Button>
                            </Box>
                            <IconButton
                              size="small"
                              color="error"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleStartDeleteJob(job.id)
                              }}
                              sx={{
                                transition: 'all 0.2s ease-in-out',
                                '&:hover': {
                                  transform: 'scale(1.1)',
                                  backgroundColor: 'error.light',
                                },
                              }}
                            >
                              <Delete fontSize="small" />
                            </IconButton>
                          </CardActions>
                        </>
                      )}
                    </Card>
                  </Grid>
                )
              })}
            </Grid>
          </Box>
        ) : searchQuery ? (
          <Card elevation={2} sx={{ p: 6, textAlign: 'center' }}>
            <Search sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              No jobs found
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Try adjusting your search query
            </Typography>
            <Button
              variant="outlined"
              onClick={() => setSearchQuery('')}
            >
              Clear Search
            </Button>
          </Card>
        ) : (
          <Card elevation={2} sx={{ p: 6, textAlign: 'center' }}>
            <Work sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
              No Jobs Yet
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 500, mx: 'auto' }}>
              Create your first job posting to start screening candidates and building your team
            </Typography>
            <Button
              variant="contained"
              size="large"
              component={Link}
              href="/job/new"
              startIcon={<Work />}
              sx={{
                textTransform: 'none',
                px: 4,
                py: 1.5,
              }}
            >
              Create Your First Job
            </Button>
          </Card>
        )}
      </Container>
    </Box>
  )
}
