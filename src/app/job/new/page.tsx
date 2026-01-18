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
import CircularProgress from '@mui/material/CircularProgress'
import Tooltip from '@mui/material/Tooltip'
import Divider from '@mui/material/Divider'
import { 
  ArrowBack, 
  Add, 
  Work, 
  CheckCircle, 
  Description, 
  Code, 
  School, 
  Public,
  Info,
  TrendingUp,
  BusinessCenter,
  Star
} from '@mui/icons-material'
import { ExperienceLevel, Job } from '@/types'

const SKILL_PATTERNS: { tag: string; patterns: RegExp[]; category: 'frontend' | 'backend' | 'devops' | 'database' | 'language' }[] = [
  // Frontend
  { tag: 'React', patterns: [/\breact\.?js\b/i, /\breact\b/i], category: 'frontend' },
  { tag: 'Next.js', patterns: [/\bnext\.?js\b/i, /\bnextjs\b/i], category: 'frontend' },
  { tag: 'Vue', patterns: [/\bvue\.?js\b/i, /\bvue\b/i], category: 'frontend' },
  { tag: 'Angular', patterns: [/\bangular\b/i], category: 'frontend' },
  { tag: 'TypeScript', patterns: [/\bts\b/i, /\btypescript\b/i], category: 'language' },
  { tag: 'JavaScript', patterns: [/\bjs\b/i, /\bjavascript\b/i], category: 'language' },
  // Backend
  { tag: 'Node.js', patterns: [/\bnode\.?js\b/i, /\bnode\b/i], category: 'backend' },
  { tag: 'Python', patterns: [/\bpy\b/i, /\bpython\b/i], category: 'language' },
  { tag: 'Go', patterns: [/\bgolang\b/i, /\bgo\b/i], category: 'language' },
  { tag: 'Java', patterns: [/\bjava\b/i], category: 'language' },
  { tag: 'Ruby', patterns: [/\bruby\b/i], category: 'language' },
  { tag: 'Rust', patterns: [/\brust\b/i], category: 'language' },
  // Database
  { tag: 'PostgreSQL', patterns: [/\bpostgres\b/i, /\bpostgresql\b/i], category: 'database' },
  { tag: 'MongoDB', patterns: [/\bmongo\b/i, /\bmongodb\b/i], category: 'database' },
  { tag: 'Redis', patterns: [/\bredis\b/i], category: 'database' },
  { tag: 'MySQL', patterns: [/\bmysql\b/i], category: 'database' },
  // DevOps/Cloud
  { tag: 'AWS', patterns: [/\baws\b/i, /\bamazon web services\b/i], category: 'devops' },
  { tag: 'Docker', patterns: [/\bdocker\b/i], category: 'devops' },
  { tag: 'Kubernetes', patterns: [/\bk8s\b/i, /\bkubernetes\b/i], category: 'devops' },
  { tag: 'GraphQL', patterns: [/\bgraphql\b/i, /\bgql\b/i], category: 'backend' },
  { tag: 'Git', patterns: [/\bgit\b/i], category: 'devops' },
  { tag: 'CI/CD', patterns: [/\bcicd\b/i, /\bci\/cd\b/i, /\bcontinuous integration\b/i], category: 'devops' },
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
  const [showTagCategories, setShowTagCategories] = useState(false)

  const lastDetectedSkills = useRef<Set<string>>(new Set())

  // Group tags by category
  const tagsByCategory = SKILL_PATTERNS.reduce((acc, { tag, category }) => {
    if (!acc[category]) acc[category] = []
    acc[category].push(tag)
    return acc
  }, {} as Record<string, string[]>)

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

  const categoryLabels: Record<string, string> = {
    frontend: 'Frontend',
    backend: 'Backend',
    language: 'Languages',
    database: 'Databases',
    devops: 'DevOps & Cloud',
  }

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default' }}>
      {/* Header */}
      <AppBar position="sticky" elevation={1} sx={{ backgroundColor: 'background.paper' }}>
        <Toolbar sx={{ maxWidth: 'md', width: '100%', mx: 'auto', px: { xs: 2, sm: 3 } }}>
          <IconButton 
            edge="start" 
            color="inherit" 
            onClick={() => router.back()} 
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

      <Container maxWidth="md" sx={{ py: { xs: 2, sm: 4 }, px: { xs: 2, sm: 3 } }}>
        {/* Header Section */}
        <Box sx={{ mb: 4, textAlign: 'center' }}>
          <Typography variant="h4" sx={{ fontWeight: 600, mb: 1, color: 'text.primary' }}>
            Create Your Job Posting
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Tell us about the role and we'll help you find the perfect candidates
          </Typography>
        </Box>

        <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Role Title */}
          <Card elevation={2} sx={{ borderRadius: 3 }}>
            <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <Work color="primary" sx={{ fontSize: 20 }} />
                <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary' }}>
                  Role Information
                </Typography>
              </Box>
              <TextField
                fullWidth
                required
                label="Job Title"
                placeholder="e.g., Senior Full-Stack Engineer, Product Designer, DevOps Lead"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                helperText="Be specific about the role and level"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  },
                }}
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
          <Card elevation={2} sx={{ borderRadius: 3 }}>
            <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <Description color="primary" sx={{ fontSize: 20 }} />
                <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary' }}>
                  Job Description
                </Typography>
                <Tooltip 
                  title="We'll automatically detect technologies mentioned in your description"
                  arrow
                  placement="top"
                >
                  <IconButton size="small" sx={{ ml: 'auto', color: 'text.secondary' }}>
                    <Info fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
              <TextField
                fullWidth
                multiline
                rows={8}
                label="Describe the role, responsibilities, and requirements"
                placeholder="Example: We're looking for a Senior Full-Stack Engineer to join our growing team. You'll work with React, TypeScript, and Node.js to build scalable web applications. Experience with AWS and Docker is a plus. This role requires 3+ years of experience and startup experience is preferred..."
                value={description}
                onChange={handleDescriptionChange}
                helperText={`${description.length} characters`}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  },
                }}
              />
            </CardContent>
          </Card>

          {/* Tech Stack */}
          <Card elevation={2} sx={{ borderRadius: 3 }}>
            <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Code color="primary" sx={{ fontSize: 20 }} />
                  <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary' }}>
                    Required Tech Stack
                  </Typography>
                </Box>
                {techStack.length > 0 && (
                  <Chip 
                    label={`${techStack.length} selected`} 
                    size="small" 
                    color="primary" 
                    variant="outlined"
                  />
                )}
              </Box>

              {/* Selected Tags */}
              {techStack.length > 0 && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5, fontWeight: 500 }}>
                    Selected Technologies
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {techStack.map((tag) => (
                      <Chip
                        key={tag}
                        label={tag}
                        onDelete={() => handleRemoveTag(tag)}
                        color="primary"
                        size="medium"
                        sx={{
                          fontSize: '0.875rem',
                          fontWeight: 500,
                          '& .MuiChip-deleteIcon': {
                            fontSize: '1.125rem',
                          },
                        }}
                      />
                    ))}
                  </Box>
                </Box>
              )}

              {/* Quick Add Common Tags */}
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                    Quick Add Technologies
                  </Typography>
                  <Button
                    size="small"
                    onClick={() => setShowTagCategories(!showTagCategories)}
                    sx={{ textTransform: 'none', minWidth: 'auto', px: 1 }}
                  >
                    {showTagCategories ? 'Hide Categories' : 'Show by Category'}
                  </Button>
                </Box>
                
                {showTagCategories ? (
                  // Show tags grouped by category
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {Object.entries(tagsByCategory).map(([category, tags]) => {
                      const availableTags = tags.filter(tag => !techStack.includes(tag))
                      if (availableTags.length === 0) return null
                      
                      return (
                        <Box key={category}>
                          <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary', mb: 1, display: 'block' }}>
                            {categoryLabels[category]}
                          </Typography>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                            {availableTags.map((tag) => (
                              <Chip
                                key={tag}
                                label={tag}
                                onClick={() => handleAddTag(tag)}
                                variant="outlined"
                                size="small"
                                sx={{ 
                                  cursor: 'pointer',
                                  transition: 'all 0.2s',
                                  '&:hover': {
                                    backgroundColor: 'primary.light',
                                    color: 'primary.contrastText',
                                    borderColor: 'primary.main',
                                  },
                                }}
                              />
                            ))}
                          </Box>
                        </Box>
                      )
                    })}
                  </Box>
                ) : (
                  // Show all tags in one list
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {uniqueTags.map((tag) => (
                      <Chip
                        key={tag}
                        label={tag}
                        onClick={() => handleAddTag(tag)}
                        variant="outlined"
                        size="small"
                        sx={{ 
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          '&:hover': {
                            backgroundColor: 'primary.light',
                            color: 'primary.contrastText',
                            borderColor: 'primary.main',
                          },
                        }}
                      />
                    ))}
                  </Box>
                )}
              </Box>

              <Divider sx={{ my: 2 }} />

              {/* Custom Tag Input */}
              <Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5, fontWeight: 500 }}>
                  Add Custom Technology
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="e.g., TensorFlow, Swift, Terraform..."
                    value={customTag}
                    onChange={(e) => setCustomTag(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        if (customTag.trim()) {
                          handleAddTag(customTag.trim())
                        }
                      }
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                      },
                    }}
                  />
                  <Button
                    variant="contained"
                    onClick={() => {
                      if (customTag.trim()) {
                        handleAddTag(customTag.trim())
                      }
                    }}
                    startIcon={<Add />}
                    size="small"
                    disabled={!customTag.trim()}
                    sx={{ 
                      minWidth: 100,
                      borderRadius: 2,
                    }}
                  >
                    Add
                  </Button>
                </Box>
              </Box>
            </CardContent>
          </Card>

          {/* Experience Level */}
          <Card elevation={2} sx={{ borderRadius: 3 }}>
            <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <School color="primary" sx={{ fontSize: 20 }} />
                <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary' }}>
                  Experience Level
                </Typography>
              </Box>
              <Grid container spacing={2}>
                {[
                  { value: 'none' as ExperienceLevel, label: 'Entry Level', desc: '0 years', Icon: TrendingUp },
                  { value: '1-3' as ExperienceLevel, label: 'Mid Level', desc: '1-3 years', Icon: BusinessCenter },
                  { value: '3+' as ExperienceLevel, label: 'Senior', desc: '3+ years', Icon: Star },
                ].map((option) => {
                  const IconComponent = option.Icon
                  return (
                    <Grid size={{ xs: 12, sm: 4 }} key={option.value}>
                      <Button
                        fullWidth
                        variant={experienceLevel === option.value ? 'contained' : 'outlined'}
                        onClick={() => setExperienceLevel(option.value)}
                        sx={{
                          py: 2.5,
                          px: 2,
                          flexDirection: 'column',
                          gap: 1,
                          textTransform: 'none',
                          borderRadius: 3,
                          borderWidth: experienceLevel === option.value ? 0 : 2,
                          transition: 'all 0.2s ease-in-out',
                          '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: experienceLevel === option.value ? 4 : 2,
                          },
                        }}
                      >
                        <IconComponent 
                          sx={{ 
                            fontSize: 32,
                            color: experienceLevel === option.value ? 'inherit' : 'primary.main',
                            mb: 0.5,
                          }} 
                        />
                        <Typography variant="body1" fontWeight={600}>
                          {option.label}
                        </Typography>
                        <Typography variant="caption" color={experienceLevel === option.value ? 'inherit' : 'text.secondary'}>
                          {option.desc}
                        </Typography>
                      </Button>
                    </Grid>
                  )
                })}
              </Grid>
            </CardContent>
          </Card>

          {/* Preferences */}
          <Card elevation={2} sx={{ borderRadius: 3 }}>
            <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <Public color="primary" sx={{ fontSize: 20 }} />
                <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary' }}>
                  Additional Preferences
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={visaSponsorship}
                      onChange={(e) => setVisaSponsorship(e.target.checked)}
                      sx={{
                        '& .MuiSvgIcon-root': {
                          fontSize: 24,
                        },
                      }}
                    />
                  }
                  label={
                    <Box>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        Visa Sponsorship Available
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        We can sponsor work visas for international candidates
                      </Typography>
                    </Box>
                  }
                  sx={{ alignItems: 'flex-start', m: 0 }}
                />
                <Divider />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={startupExperience}
                      onChange={(e) => setStartupExperience(e.target.checked)}
                      sx={{
                        '& .MuiSvgIcon-root': {
                          fontSize: 24,
                        },
                      }}
                    />
                  }
                  label={
                    <Box>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        Startup Experience Preferred
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Prioritize candidates with early-stage startup experience
                      </Typography>
                    </Box>
                  }
                  sx={{ alignItems: 'flex-start', m: 0 }}
                />
                <Divider />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={portfolioRequired}
                      onChange={(e) => setPortfolioRequired(e.target.checked)}
                      sx={{
                        '& .MuiSvgIcon-root': {
                          fontSize: 24,
                        },
                      }}
                    />
                  }
                  label={
                    <Box>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        Portfolio Required
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Candidates must provide a portfolio or GitHub profile
                      </Typography>
                    </Box>
                  }
                  sx={{ alignItems: 'flex-start', m: 0 }}
                />
              </Box>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <Card elevation={0} sx={{ backgroundColor: 'transparent', mt: 1 }}>
            <CardContent sx={{ p: 0 }}>
              <Button
                type="submit"
                variant="contained"
                size="large"
                fullWidth
                disabled={!title.trim() || isSubmitting}
                sx={{ 
                  py: 2,
                  fontSize: '1rem',
                  fontWeight: 600,
                  borderRadius: 3,
                  position: 'relative',
                  transition: 'all 0.2s ease-in-out',
                  background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
                  boxShadow: '0 4px 14px 0 rgba(25, 118, 210, 0.39)',
                  '&:hover:not(:disabled)': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 6px 20px 0 rgba(25, 118, 210, 0.5)',
                    background: 'linear-gradient(135deg, #1e88e5 0%, #1976d2 100%)',
                  },
                  '&:active:not(:disabled)': {
                    transform: 'translateY(0)',
                  },
                }}
                startIcon={
                  isSubmitting ? (
                    <CircularProgress size={22} color="inherit" />
                  ) : (
                    <CheckCircle sx={{ fontSize: 22 }} />
                  )
                }
              >
                {isSubmitting ? 'Creating Job Posting...' : 'Create Job & Start Reviewing Candidates'}
              </Button>
              {!title.trim() && (
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block', textAlign: 'center' }}>
                  Please enter a job title to continue
                </Typography>
              )}
            </CardContent>
          </Card>
        </Box>
      </Container>
    </Box>
  )
}