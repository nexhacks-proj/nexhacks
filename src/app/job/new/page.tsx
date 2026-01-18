'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useStore } from '@/store/useStore'
import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import Container from '@mui/material/Container'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Chip from '@mui/material/Chip'
import Checkbox from '@mui/material/Checkbox'
import FormControlLabel from '@mui/material/FormControlLabel'
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid2'
import InputAdornment from '@mui/material/InputAdornment'
import { ArrowBack, Add, Work, CheckCircle } from '@mui/icons-material'
import CircularProgress from '@mui/material/CircularProgress'
import { ExperienceLevel, Job } from '@/types'

const SKILL_PATTERNS: { tag: string; patterns: RegExp[] }[] = [
  { tag: 'React', patterns: [/\breact\.?js\b/i, /\breact\b/i] },
  { tag: 'TypeScript', patterns: [/\bts\b/i, /\btypescript\b/i] },
  { tag: 'JavaScript', patterns: [/\bjs\b/i, /\bjavascript\b/i] },
  { tag: 'Node.js', patterns: [/\bnode\.?js\b/i, /\bnode\b/i] },
  { tag: 'Python', patterns: [/\bpy\b/i, /\bpython\b/i] },
  { tag: 'Go', patterns: [/\bgolang\b/i, /\bgo\b/i] },
  { tag: 'Java', patterns: [/\bjava\b/i] },
  { tag: 'PostgreSQL', patterns: [/\bpostgres\b/i, /\bpostgresql\b/i] },
  { tag: 'MongoDB', patterns: [/\bmongo\b/i, /\bmongodb\b/i] },
  { tag: 'AWS', patterns: [/\baws\b/i, /\bamazon web services\b/i] },
  { tag: 'Docker', patterns: [/\bdocker\b/i] },
  { tag: 'Kubernetes', patterns: [/\bk8s\b/i, /\bkubernetes\b/i] },
  { tag: 'Next.js', patterns: [/\bnext\.?js\b/i, /\bnextjs\b/i] },
  { tag: 'Vue', patterns: [/\bvue\.?js\b/i, /\bvue\b/i] },
  { tag: 'Angular', patterns: [/\bangular\b/i] },
  { tag: 'Ruby', patterns: [/\bruby\b/i] },
  { tag: 'Rust', patterns: [/\brust\b/i] },
  { tag: 'GraphQL', patterns: [/\bgraphql\b/i, /\bgql\b/i] },
]

export default function NewJobPage() {
  const router = useRouter()
  const { createJob } = useStore()

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [techStack, setTechStack] = useState<string[]>([])
  const [customTag, setCustomTag] = useState('')
  const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel>('1-3')
  const [visaSponsorship, setVisaSponsorship] = useState(false)
  const [startupExperience, setStartupExperience] = useState(false)
  const [portfolioRequired, setPortfolioRequired] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const lastDetectedSkills = useRef<Set<string>>(new Set())

  const handleAddTag = (tag: string) => {
    if (tag && !techStack.includes(tag)) {
      setTechStack([...techStack, tag])
    }
    setCustomTag('')
  }

  const handleRemoveTag = (tag: string) => {
    setTechStack(techStack.filter((t) => t !== tag))
  }

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newDescription = e.target.value
    setDescription(newDescription)

    const currentDetected = new Set<string>()
    SKILL_PATTERNS.forEach(({ tag, patterns }) => {
      if (patterns.some((p) => p.test(newDescription))) {
        currentDetected.add(tag)
      }
    })

    const currentArray = Array.from(currentDetected)
    const lastArray = Array.from(lastDetectedSkills.current)

    const newlyDetected = currentArray.filter((tag) => !lastDetectedSkills.current.has(tag))
    const noLongerDetected = lastArray.filter((tag) => !currentDetected.has(tag))

    setTechStack((prevStack) => {
      const newStack = new Set(prevStack)
      newlyDetected.forEach((tag) => newStack.add(tag))
      noLongerDetected.forEach((tag) => newStack.delete(tag))
      return Array.from(newStack)
    })

    lastDetectedSkills.current = currentDetected
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || isSubmitting) return

    setIsSubmitting(true)

    try {
      // Optimistic update - create job immediately in store for instant feedback
      const optimisticJob = createJob({
        title: title.trim(),
        description: description.trim(),
        techStack,
        experienceLevel,
        visaSponsorship,
        startupExperiencePreferred: startupExperience,
        portfolioRequired,
      })

      // Navigate immediately for instant feel
      router.push(`/job/${optimisticJob.id}/upload`)

      // Then sync with server in background (non-blocking)
      fetch('/api/jobs/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          techStack,
          experienceLevel,
          visaSponsorship,
          startupExperiencePreferred: startupExperience,
          portfolioRequired,
        }),
      })
        .then(async (response) => {
          if (response.ok) {
            const data = await response.json()
            const job = data.job
            const jobWithDates: Job = {
              ...job,
              createdAt: job.createdAt ? new Date(job.createdAt) : new Date(),
            }
            // Update store with server response (may have different ID)
            const { jobs: currentJobs, currentJob } = useStore.getState()
            useStore.setState({
              jobs: currentJobs.map(j => j.id === optimisticJob.id ? jobWithDates : j),
              currentJob: currentJob?.id === optimisticJob.id ? jobWithDates : currentJob,
            })
            // Update URL if ID changed
            if (job.id !== optimisticJob.id) {
              router.replace(`/job/${job.id}/upload`)
            }
          }
        })
        .catch((error) => {
          console.error('Background sync failed (using local job):', error)
          // Job already created locally, so user can continue
        })
    } catch (error) {
      console.error('Error creating job:', error)
      setIsSubmitting(false)
      // Fallback: try again with local-only creation
      const job = createJob({
        title: title.trim(),
        description: description.trim(),
        techStack,
        experienceLevel,
        visaSponsorship,
        startupExperiencePreferred: startupExperience,
        portfolioRequired,
      })
      router.push(`/job/${job.id}/upload`)
    }
  }

  const uniqueTags = Array.from(new Set(SKILL_PATTERNS.map((p) => p.tag))).filter(
    (tag) => !techStack.includes(tag)
  )

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default' }}>
      {/* Header */}
      <AppBar position="sticky" elevation={1} sx={{ backgroundColor: 'background.paper' }}>
        <Toolbar sx={{ maxWidth: 'md', width: '100%', mx: 'auto', px: { xs: 2, sm: 3 } }}>
          <IconButton 
            edge="start" 
            color="inherit" 
            onClick={() => router.push('/')} 
            sx={{ 
              mr: 2, 
              color: 'text.primary',
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                backgroundColor: 'action.hover',
                transform: 'scale(1.05)',
              },
            }}
          >
            <ArrowBack />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ color: 'text.primary', fontWeight: 500 }}>
            Create New Job
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{ py: 3, px: { xs: 2, sm: 3 } }}>
        <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Role Title */}
          <Card elevation={2}>
            <CardContent sx={{ p: 3 }}>
              <TextField
                fullWidth
                required
                label="Role Title"
                placeholder="e.g., Senior Full-Stack Engineer"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Work color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </CardContent>
          </Card>

          {/* Job Description */}
          <Card elevation={2}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                We'll automatically detect tech stack skills as you type.
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={6}
                label="Job Description"
                placeholder="e.g. We are looking for a Senior React developer with Node.js experience..."
                value={description}
                onChange={handleDescriptionChange}
                sx={{ mt: 2 }}
              />
            </CardContent>
          </Card>

          {/* Tech Stack */}
          <Card elevation={2}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="body2" fontWeight={500} gutterBottom sx={{ mb: 2 }}>
                Required Tech Stack
              </Typography>

              {/* Selected Tags */}
              {techStack.length > 0 && (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                  {techStack.map((tag) => (
                    <Chip
                      key={tag}
                      label={tag}
                      onDelete={() => handleRemoveTag(tag)}
                      color="primary"
                      size="small"
                    />
                  ))}
                </Box>
              )}

              {/* Common Tags */}
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                {uniqueTags.map((tag) => (
                  <Chip
                    key={tag}
                    label={tag}
                    onClick={() => handleAddTag(tag)}
                    variant="outlined"
                    size="small"
                    sx={{ cursor: 'pointer' }}
                  />
                ))}
              </Box>

              {/* Custom Tag Input */}
              <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Add custom technology..."
                  value={customTag}
                  onChange={(e) => setCustomTag(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      handleAddTag(customTag)
                    }
                  }}
                />
                <Button
                  variant="outlined"
                  onClick={() => handleAddTag(customTag)}
                  startIcon={<Add />}
                  size="small"
                  sx={{ minWidth: 48 }}
                >
                  Add
                </Button>
              </Box>
            </CardContent>
          </Card>

          {/* Experience Level */}
          <Card elevation={2}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="body2" fontWeight={500} gutterBottom sx={{ mb: 2 }}>
                Experience Level
              </Typography>
              <Grid container spacing={1.5}>
                {[
                  { value: 'none' as ExperienceLevel, label: 'Entry Level', desc: '0 years' },
                  { value: '1-3' as ExperienceLevel, label: 'Mid Level', desc: '1-3 years' },
                  { value: '3+' as ExperienceLevel, label: 'Senior', desc: '3+ years' },
                ].map((option) => (
                  <Grid size={4} key={option.value}>
                    <Button
                      fullWidth
                      variant={experienceLevel === option.value ? 'contained' : 'outlined'}
                      onClick={() => setExperienceLevel(option.value)}
                      sx={{
                        py: 2,
                        flexDirection: 'column',
                        gap: 0.5,
                        textTransform: 'none',
                      }}
                    >
                      <Typography variant="body2" fontWeight={500}>
                        {option.label}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {option.desc}
                      </Typography>
                    </Button>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>

          {/* Preferences */}
          <Card elevation={2}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="body2" fontWeight={500} gutterBottom sx={{ mb: 2 }}>
                Preferences
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={visaSponsorship}
                      onChange={(e) => setVisaSponsorship(e.target.checked)}
                    />
                  }
                  label="Visa sponsorship allowed"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={startupExperience}
                      onChange={(e) => setStartupExperience(e.target.checked)}
                    />
                  }
                  label="Startup experience preferred"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={portfolioRequired}
                      onChange={(e) => setPortfolioRequired(e.target.checked)}
                    />
                  }
                  label="Portfolio required"
                />
              </Box>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <Button
            type="submit"
            variant="contained"
            size="large"
            fullWidth
            disabled={!title.trim() || isSubmitting}
            sx={{ 
              py: 1.5,
              position: 'relative',
              transition: 'all 0.2s ease-in-out',
              '&:hover:not(:disabled)': {
                transform: 'translateY(-1px)',
                boxShadow: 4,
              },
            }}
            startIcon={
              isSubmitting ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                <CheckCircle />
              )
            }
          >
            {isSubmitting ? 'Creating Job...' : 'Create Job & Start Reviewing'}
          </Button>
        </Box>
      </Container>
    </Box>
  )
}