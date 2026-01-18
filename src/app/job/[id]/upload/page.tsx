'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useStore } from '@/store/useStore'
import ResumeUploader from '@/components/ResumeUploader'
import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import Container from '@mui/material/Container'
import Button from '@mui/material/Button'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import { ArrowBack, SkipNext } from '@mui/icons-material'

export default function UploadCandidatesPage() {
  const router = useRouter()
  const params = useParams()
  const jobId = params.id as string
  const [hasCheckedStore, setHasCheckedStore] = useState(false)

  const { jobs, currentJob, setCurrentJob } = useStore()

  useEffect(() => {
    // Wait a tick for Zustand to hydrate from localStorage
    const timeoutId = setTimeout(() => {
      const job = jobs.find((j) => j.id === jobId)
      if (job) {
        setCurrentJob(job)
      }
      setHasCheckedStore(true)
    }, 50)

    return () => clearTimeout(timeoutId)
  }, [jobId, jobs, setCurrentJob])

  // Only redirect after we've checked the store and still can't find the job
  useEffect(() => {
    if (hasCheckedStore && !currentJob) {
      const job = jobs.find((j) => j.id === jobId)
      if (!job) {
        router.push('/')
      }
    }
  }, [hasCheckedStore, currentJob, jobs, jobId, router])

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

      </Container>
    </Box>
  )
}