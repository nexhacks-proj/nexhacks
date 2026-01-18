'use client'

import { useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useStore } from '@/store/useStore'
import ResumeUploader from '@/components/ResumeUploader'
import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import Container from '@mui/material/Container'
import Button from '@mui/material/Button'
import Paper from '@mui/material/Paper'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import { ArrowBack, SkipNext } from '@mui/icons-material'

export default function UploadCandidatesPage() {
  const router = useRouter()
  const params = useParams()
  const jobId = params.id as string

  const { jobs, currentJob, setCurrentJob } = useStore()

  useEffect(() => {
    const job = jobs.find((j) => j.id === jobId)
    if (job) {
      setCurrentJob(job)
    } else {
      router.push('/')
    }
  }, [jobId, jobs, setCurrentJob, router])

  if (!currentJob) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default' }}>
      {/* Header */}
      <AppBar position="sticky" elevation={1} sx={{ backgroundColor: 'background.paper' }}>
        <Toolbar sx={{ maxWidth: 'md', width: '100%', mx: 'auto', px: { xs: 2, sm: 3 } }}>
          <IconButton
            edge="start"
            color="inherit"
            onClick={() => router.push(`/job/${jobId}/swipe`)}
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
          <Box>
            <Typography variant="h6" component="div" sx={{ color: 'text.primary', fontWeight: 500 }}>
              Upload Candidates
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {currentJob.title}
            </Typography>
          </Box>
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{ py: 3, px: { xs: 2, sm: 3 } }}>
        <ResumeUploader
          job={currentJob}
          onComplete={(candidateIds) => {
            // #region agent log
            fetch('http://127.0.0.1:7242/ingest/b0c145db-8445-481e-8029-d20c16f75259',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'upload/page.tsx:84',message:'onComplete called',data:{jobId,candidateIdsCount:candidateIds.length,currentJobId:currentJob?.id,jobsCount:jobs.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
            // #endregion
            const targetPath = `/job/${jobId}/swipe`
            // #region agent log
            fetch('http://127.0.0.1:7242/ingest/b0c145db-8445-481e-8029-d20c16f75259',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'upload/page.tsx:87',message:'About to navigate',data:{targetPath,jobId},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
            // #endregion
            router.push(targetPath)
            // #region agent log
            fetch('http://127.0.0.1:7242/ingest/b0c145db-8445-481e-8029-d20c16f75259',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'upload/page.tsx:90',message:'router.push called',data:{targetPath},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
            // #endregion
          }}
          onMockComplete={() => {
            // #region agent log
            fetch('http://127.0.0.1:7242/ingest/b0c145db-8445-481e-8029-d20c16f75259',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'upload/page.tsx:93',message:'onMockComplete called',data:{jobId,currentJobId:currentJob?.id,jobsCount:jobs.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
            // #endregion
            const targetPath = `/job/${jobId}/swipe`
            // #region agent log
            fetch('http://127.0.0.1:7242/ingest/b0c145db-8445-481e-8029-d20c16f75259',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'upload/page.tsx:96',message:'About to navigate (mock)',data:{targetPath,jobId},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
            // #endregion
            router.push(targetPath)
            // #region agent log
            fetch('http://127.0.0.1:7242/ingest/b0c145db-8445-481e-8029-d20c16f75259',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'upload/page.tsx:99',message:'router.push called (mock)',data:{targetPath},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
            // #endregion
          }}
        />

        {/* Skip Upload Button */}
        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
          <Button
            variant="outlined"
            startIcon={<SkipNext />}
            onClick={() => router.push(`/job/${jobId}/swipe`)}
            sx={{ 
              px: 3,
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                transform: 'translateY(-1px)',
                boxShadow: 2,
              },
            }}
          >
            Skip Upload and Continue Swiping
          </Button>
        </Box>

        {/* Info Box */}
        <Paper
          elevation={2}
          sx={{
            mt: 3,
            p: 2,
            backgroundColor: 'primary.light',
            background: 'linear-gradient(to right, rgba(25, 118, 210, 0.08), rgba(25, 118, 210, 0.04))',
          }}
        >
          <Typography variant="subtitle2" fontWeight={600} gutterBottom sx={{ color: 'primary.main' }}>
            How it works
          </Typography>
          <Box component="ul" sx={{ m: 0, pl: 2, color: 'text.secondary' }}>
            <Typography component="li" variant="body2" sx={{ mb: 0.5 }}>
              Upload resume files (PDF, Word, or text) or paste text
            </Typography>
            <Typography component="li" variant="body2" sx={{ mb: 0.5 }}>
              Cerebras AI extracts skills, experience, and projects
            </Typography>
            <Typography component="li" variant="body2" sx={{ mb: 0.5 }}>
              AI generates tailored summaries based on your job requirements
            </Typography>
            <Typography component="li" variant="body2">
              Review candidates in the swipe interface
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  )
}