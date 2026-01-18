'use client'

import { useState } from 'react'
import Paper from '@mui/material/Paper'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import LinearProgress from '@mui/material/LinearProgress'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemText from '@mui/material/ListItemText'
import ListItemIcon from '@mui/material/ListItemIcon'
import IconButton from '@mui/material/IconButton'
import Divider from '@mui/material/Divider'
import {
  CloudUpload,
  Description,
  Close,
  CheckCircle,
  Error as ErrorIcon,
  AutoAwesome,
} from '@mui/icons-material'
import { Job, Candidate } from '@/types'
import { useStore } from '@/store/useStore'
import { extractTextFromFile, validateFileType } from '@/lib/fileConverter'
import { addToMockResumes, mockRawResumes, mockWorkdayResumes } from '@/data/mockCandidates'

interface ResumeFile {
  id: string
  name: string
  email: string
  rawResume: string
}

interface ResumeUploaderProps {
  job: Job
  onComplete: (candidateIds: string[]) => void
  onMockComplete?: () => void
}

export default function ResumeUploader({ job, onComplete, onMockComplete }: ResumeUploaderProps) {
  const { addCandidate } = useStore()
  const [resumes, setResumes] = useState<ResumeFile[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState({ current: 0, total: 0 })
  const [error, setError] = useState<string | null>(null)
  const [manualText, setManualText] = useState('')
  const [isLoadingMock, setIsLoadingMock] = useState(false)
  const [isConvertingFiles, setIsConvertingFiles] = useState(false)
  const [conversionProgress, setConversionProgress] = useState({ current: 0, total: 0 })

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    setError(null)
    setIsConvertingFiles(true)
    setConversionProgress({ current: 0, total: files.length })
    const newResumes: ResumeFile[] = []

    const filePromises = Array.from(files).map(async (file, i) => {
      const validation = validateFileType(file)
      if (!validation.valid) {
        setError(validation.error || 'Invalid file type')
        return null
      }

      try {
        const text = await extractTextFromFile(file)
        setConversionProgress({ current: i + 1, total: files.length })

        const emailMatch = text.match(/[\w.-]+@[\w.-]+\.\w+/)
        const email = emailMatch ? emailMatch[0] : `candidate${Date.now()}-${i}@example.com`

        return {
          id: `upload-${Date.now()}-${i}`,
          name: file.name.replace(/\.[^/.]+$/, ''),
          email,
          rawResume: text,
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to read file'
        console.error('File upload error:', err)
        setError(`Failed to process ${file.name}: ${errorMessage}`)
        return null
      }
    })

    const results = await Promise.all(filePromises)
    const validResumes = results.filter((r): r is ResumeFile => r !== null)

    for (const resume of validResumes) {
      addToMockResumes(resume)
    }

    setIsConvertingFiles(false)

    if (validResumes.length > 0) {
      await processResumesImmediately(validResumes)
    }
  }

  const handlePaste = async (e: React.ClipboardEvent) => {
    setTimeout(async () => {
      const target = e.currentTarget as HTMLInputElement
      const text = target?.value || ''
      if (text.trim()) {
        await handleManualSubmit(text)
      }
    }, 100)
  }

  const handleManualSubmit = async (text?: string) => {
    const resumeText = text || manualText
    if (!resumeText.trim()) return

    setError(null)

    const emailMatch = resumeText.match(/[\w.-]+@[\w.-]+\.\w+/)
    const email = emailMatch ? emailMatch[0] : `candidate${Date.now()}@example.com`

    const newResume = {
      id: `paste-${Date.now()}`,
      name: `Candidate ${Date.now()}`,
      email,
      rawResume: resumeText,
    }

    addToMockResumes(newResume)
    setManualText('')
    await processResumesImmediately([newResume])
  }

  const removeResume = (id: string) => {
    setResumes(resumes.filter((r) => r.id !== id))
  }

  const processResumesImmediately = async (resumesToProcess: ResumeFile[]) => {
    setIsProcessing(true)
    setError(null)
    setProgress({ current: 0, total: resumesToProcess.length })

    const processedIds: string[] = []

    for (let i = 0; i < resumesToProcess.length; i++) {
      const resume = resumesToProcess[i]

      try {
        const response = await fetch('/api/candidates/parse-batch', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            resumes: [resume],
            job,
          }),
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
          console.error(`Failed to parse resume ${i + 1}:`, errorData.error || 'Unknown error')
          continue
        }

        const data = await response.json()

        if (data.candidates && data.candidates.length > 0) {
          for (const candidate of data.candidates) {
            const parsedCandidate: Candidate = {
              ...candidate,
              jobId: job.id,
              status: 'pending' as const,
            }
            addCandidate(parsedCandidate)
            processedIds.push(candidate.id)
          }
        }

        setProgress({ current: i + 1, total: resumesToProcess.length })
      } catch (err) {
        console.error(`Error processing resume ${i + 1}:`, err)
      }
    }

    setIsProcessing(false)

    if (processedIds.length > 0) {
      onComplete(processedIds)
    }
  }

  const processResumes = async () => {
    if (resumes.length === 0) return

    setIsProcessing(true)
    setError(null)
    setProgress({ current: 0, total: resumes.length })

    const processedIds: string[] = []

    try {
      const response = await fetch('/api/candidates/parse-batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resumes,
          job,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        throw new Error(errorData.error || 'Failed to parse resumes')
      }

      const data = await response.json()

      for (const candidate of data.candidates) {
        const parsedCandidate: Candidate = {
          ...candidate,
          jobId: job.id,
          status: 'pending' as const,
        }
        addCandidate(parsedCandidate)
        processedIds.push(candidate.id)
      }

      setProgress({ current: resumes.length, total: resumes.length })
    } catch (err) {
      console.error('Error processing resumes:', err)
      setError(err instanceof Error ? err.message : 'Failed to process resumes')
    }

    setIsProcessing(false)

    if (processedIds.length > 0) {
      onComplete(processedIds)
      setResumes([])
    }
  }

  const loadMockCandidates = async () => {
    setIsLoadingMock(true)
    setError(null)
    setProgress({ current: 0, total: mockRawResumes.length })

    const processedIds: string[] = []

    for (let i = 0; i < mockRawResumes.length; i++) {
      const resume = mockRawResumes[i]

      try {
        const response = await fetch('/api/candidates/parse-batch', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            resumes: [resume],
            job,
          }),
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
          console.error(`Failed to parse mock resume ${i + 1}:`, errorData.error || 'Unknown error')
          continue
        }

        const data = await response.json()

        if (data.candidates && data.candidates.length > 0) {
          for (const candidate of data.candidates) {
            const parsedCandidate: Candidate = {
              ...candidate,
              jobId: job.id,
              status: 'pending' as const,
            }
            addCandidate(parsedCandidate)
            processedIds.push(candidate.id)
          }
        }

        setProgress({ current: i + 1, total: mockRawResumes.length })
      } catch (err) {
        console.error(`Error processing mock resume ${i + 1}:`, err)
      }
    }

    setIsLoadingMock(false)

    if (processedIds.length > 0) {
      if (onMockComplete) {
        onMockComplete()
      } else {
        onComplete(processedIds)
      }
    }
  }

  const loadWorkdayCandidates = async () => {
    setIsLoadingMock(true)
    setError(null)
    setProgress({ current: 0, total: mockWorkdayResumes.length })

    for (let i = 0; i < mockWorkdayResumes.length; i++) {
      const resume = mockWorkdayResumes[i]

      try {
        const response = await fetch('/api/candidates/parse-batch', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            resumes: [resume],
            job,
          }),
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
          console.error(`Failed to parse workday resume ${i + 1}:`, errorData.error || 'Unknown error')
          continue
        }

        const data = await response.json()

        if (data.candidates && data.candidates.length > 0) {
          for (const candidate of data.candidates) {
            const parsedCandidate: Candidate = {
              ...candidate,
              jobId: job.id,
              status: 'pending' as const,
            }
            addCandidate(parsedCandidate)
          }
        }

        setProgress({ current: i + 1, total: mockWorkdayResumes.length })
      } catch (err) {
        console.error(`Error processing workday resume ${i + 1}:`, err)
      }
    }

    setIsLoadingMock(false)
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {/* Upload Area */}
      <Paper
        variant="outlined"
        sx={{
          p: 4,
          textAlign: 'center',
          borderStyle: 'dashed',
          borderWidth: 2,
          borderColor: 'divider',
        }}
      >
        <CloudUpload sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 500 }}>
          Upload Resumes or Paste Text
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Resumes are processed immediately with Cerebras AI
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Supports PDF, Word (.docx), and text files
        </Typography>

        <Box sx={{ mt: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, justifyContent: 'center' }}>
            <input
              type="file"
              multiple
              accept=".txt,.pdf,.docx,.doc,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              onChange={handleFileUpload}
              style={{ display: 'none' }}
              id="file-upload"
              disabled={isProcessing || isLoadingMock}
            />
            <label htmlFor="file-upload">
              <Button
                component="span"
                variant="contained"
                startIcon={isProcessing ? <CircularProgress size={16} color="inherit" /> : <CloudUpload />}
                disabled={isProcessing || isLoadingMock}
              >
                {isProcessing ? 'Processing...' : 'Upload Resumes'}
              </Button>
            </label>

            <Button
              variant="outlined"
              startIcon={isLoadingMock ? <CircularProgress size={16} /> : <AutoAwesome />}
              onClick={loadMockCandidates}
              disabled={isProcessing || isLoadingMock}
            >
              {isLoadingMock ? 'Processing...' : 'Load Mock Candidates'}
            </Button>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <Button
              variant="outlined"
              onClick={loadWorkdayCandidates}
              disabled={isProcessing || isLoadingMock}
              sx={{ color: '#005cb9', borderColor: '#005cb9' }}
            >
              {isLoadingMock ? 'Importing...' : 'Import from Workday (Demo)'}
            </Button>
          </Box>

          <Divider sx={{ my: 1 }}>
            <Typography variant="caption" color="text.secondary">
              or
            </Typography>
          </Divider>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <TextField
              fullWidth
              multiline
              rows={4}
              placeholder="Paste or type resume text here..."
              value={manualText}
              onChange={(e) => setManualText(e.target.value)}
              onPaste={handlePaste}
              disabled={isProcessing || isLoadingMock}
            />
            {manualText.trim() && !isProcessing && !isLoadingMock && (
              <Button variant="contained" onClick={() => handleManualSubmit()} size="small">
                Process Text
              </Button>
            )}
          </Box>
        </Box>
      </Paper>

      {/* Resume List */}
      {resumes.length > 0 && (
        <Paper elevation={2} sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="subtitle2" fontWeight={500}>
              Ready to Process ({resumes.length})
            </Typography>
            {!isProcessing && (
              <Button
                variant="contained"
                color="success"
                startIcon={<CheckCircle />}
                onClick={processResumes}
                size="small"
              >
                Process with AI
              </Button>
            )}
          </Box>

          <List>
            {resumes.map((resume, index) => (
              <Box key={resume.id}>
                <ListItem
                  secondaryAction={
                    !isProcessing ? (
                      <IconButton edge="end" onClick={() => removeResume(resume.id)}>
                        <Close />
                      </IconButton>
                    ) : null
                  }
                >
                  <ListItemIcon>
                    <Description color="action" />
                  </ListItemIcon>
                  <ListItemText
                    primary={resume.name}
                    secondary={resume.email}
                    primaryTypographyProps={{ variant: 'body2', fontWeight: 500 }}
                    secondaryTypographyProps={{ variant: 'caption' }}
                  />
                </ListItem>
                {index < resumes.length - 1 && <Divider variant="inset" component="li" />}
              </Box>
            ))}
          </List>
        </Paper>
      )}

      {/* File Conversion State */}
      {isConvertingFiles && (
        <Paper elevation={2} sx={{ p: 3, textAlign: 'center', backgroundColor: 'info.light' }}>
          <CircularProgress size={32} sx={{ mb: 2 }} />
          <Typography variant="body2" fontWeight={500} gutterBottom>
            Converting files...
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {conversionProgress.current} of {conversionProgress.total} files converted
          </Typography>
        </Paper>
      )}

      {/* Processing State */}
      {(isProcessing || isLoadingMock) && (
        <Paper elevation={2} sx={{ p: 3, textAlign: 'center', backgroundColor: 'primary.light' }}>
          <CircularProgress size={32} sx={{ mb: 2 }} color="primary" />
          <Typography variant="body2" fontWeight={500} gutterBottom>
            {isLoadingMock ? 'Processing Mock Candidates with Cerebras AI...' : 'Processing with Cerebras AI...'}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {progress.current} of {progress.total} candidates analyzed
          </Typography>
          <Box sx={{ mt: 2, width: '100%' }}>
            <LinearProgress
              variant="determinate"
              value={(progress.current / progress.total) * 100}
              sx={{ height: 8, borderRadius: 4 }}
            />
          </Box>
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
            This may take a moment for large batches...
          </Typography>
        </Paper>
      )}

      {/* Error State */}
      {error && (
        <Alert severity="error" icon={<ErrorIcon />}>
          <Typography variant="body2" fontWeight={500} gutterBottom>
            Error
          </Typography>
          <Typography variant="body2">{error}</Typography>
        </Alert>
      )}
    </Box>
  )
}