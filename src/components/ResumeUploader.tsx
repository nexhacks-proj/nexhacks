'use client'

import { useState } from 'react'
import { Upload, FileText, X, Loader2, CheckCircle, AlertCircle, Sparkles } from 'lucide-react'
import { Job, Candidate } from '@/types'
import { useStore } from '@/store/useStore'
import { extractTextFromFile, validateFileType } from '@/lib/fileConverter'
import { addToMockResumes, mockRawResumes } from '@/data/mockCandidates'

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
  onFirstCandidateReady?: () => void
}

export default function ResumeUploader({ job, onComplete, onMockComplete, onFirstCandidateReady }: ResumeUploaderProps) {
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

    // Process files in parallel for faster conversion
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
          rawResume: text
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

  const handlePaste = async (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    setTimeout(async () => {
      const text = (e.target as HTMLTextAreaElement).value
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
      rawResume: resumeText
    }

    addToMockResumes(newResume)
    setManualText('')
    await processResumesImmediately([newResume])
  }

  const removeResume = (id: string) => {
    setResumes(resumes.filter(r => r.id !== id))
  }

  const processResumesImmediately = async (resumesToProcess: ResumeFile[]) => {
    setIsProcessing(true)
    setError(null)
    setProgress({ current: 0, total: resumesToProcess.length })
    
    let firstCandidateAdded = false
    const processedIds: string[] = []

    // Process resumes one at a time for progressive loading
    for (let i = 0; i < resumesToProcess.length; i++) {
      const resume = resumesToProcess[i]
      
      try {
        const response = await fetch('/api/candidates/parse-batch', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            resumes: [resume], // Process one at a time
            job
          })
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
              status: 'pending' as const
            }
            addCandidate(parsedCandidate)
            processedIds.push(candidate.id)
            
            // Navigate to swipe page as soon as first candidate is ready
            if (!firstCandidateAdded && onFirstCandidateReady) {
              firstCandidateAdded = true
              onFirstCandidateReady()
            }
          }
        }

        setProgress({ current: i + 1, total: resumesToProcess.length })
      } catch (err) {
        console.error(`Error processing resume ${i + 1}:`, err)
        // Continue processing other resumes even if one fails
      }
    }

    setIsProcessing(false)
    
    // Call onComplete with all processed IDs (even if navigation already happened)
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
          job
        })
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
          status: 'pending' as const
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
    
    let firstCandidateAdded = false
    const processedIds: string[] = []

    // Process mock resumes one at a time for progressive loading
    for (let i = 0; i < mockRawResumes.length; i++) {
      const resume = mockRawResumes[i]
      
      try {
        const response = await fetch('/api/candidates/parse-batch', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            resumes: [resume], // Process one at a time
            job
          })
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
              status: 'pending' as const
            }
            addCandidate(parsedCandidate)
            processedIds.push(candidate.id)
            
            // Navigate to swipe page as soon as first candidate is ready
            if (!firstCandidateAdded && onFirstCandidateReady) {
              firstCandidateAdded = true
              onFirstCandidateReady()
            }
          }
        }

        setProgress({ current: i + 1, total: mockRawResumes.length })
      } catch (err) {
        console.error(`Error processing mock resume ${i + 1}:`, err)
        // Continue processing other resumes even if one fails
      }
    }

    setIsLoadingMock(false)
    
    // Call onMockComplete or onComplete with all processed IDs
    if (processedIds.length > 0) {
      if (onMockComplete) {
        onMockComplete()
      } else {
        onComplete(processedIds)
      }
    }
  }

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl p-8 text-center">
        <Upload className="w-12 h-12 text-slate-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
          Upload Resumes or Paste Text
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">
          Resumes are processed immediately with Gemini AI
        </p>
        <p className="text-xs text-slate-400 mb-4">
          Supports PDF, Word (.docx), and text files
        </p>

        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <label className="inline-block">
              <input
                type="file"
                multiple
                accept=".txt,.pdf,.docx,.doc,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                onChange={handleFileUpload}
                className="hidden"
                disabled={isProcessing || isLoadingMock}
              />
              <span className={`px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-xl cursor-pointer inline-block transition-colors text-base font-medium ${isProcessing || isLoadingMock ? 'opacity-50 cursor-not-allowed' : ''}`}>
                {isProcessing ? 'Processing...' : 'Upload Resumes'}
              </span>
            </label>

            <button
              onClick={loadMockCandidates}
              disabled={isProcessing || isLoadingMock}
              className={`px-6 py-3 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-xl transition-colors text-base font-medium flex items-center justify-center gap-2 ${isProcessing || isLoadingMock ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isLoadingMock ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Load Mock Candidates
                </>
              )}
            </button>
          </div>

          <div className="text-sm text-slate-400">or</div>

          <div className="space-y-2">
            <textarea
              placeholder="Paste or type resume text here..."
              value={manualText}
              onChange={(e) => setManualText(e.target.value)}
              onPaste={handlePaste}
              disabled={isProcessing || isLoadingMock}
              className="w-full px-4 py-3 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent min-h-[100px] disabled:opacity-50 disabled:cursor-not-allowed resize-y"
            />
            {manualText.trim() && !isProcessing && !isLoadingMock && (
              <button
                onClick={() => handleManualSubmit()}
                className="w-full px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors text-sm font-medium"
              >
                Process Text
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Resume List */}
      {resumes.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium text-slate-900 dark:text-white">
              Ready to Process ({resumes.length})
            </h4>
            {!isProcessing && (
              <button
                onClick={processResumes}
                className="px-4 py-2 bg-success hover:bg-success/80 text-white rounded-lg transition-colors text-sm flex items-center gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                Process with AI
              </button>
            )}
          </div>

          <div className="space-y-2">
            {resumes.map((resume) => (
              <div
                key={resume.id}
                className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-slate-400" />
                  <div>
                    <p className="text-sm font-medium text-slate-900 dark:text-white">
                      {resume.name}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {resume.email}
                    </p>
                  </div>
                </div>
                {!isProcessing && (
                  <button
                    onClick={() => removeResume(resume.id)}
                    className="p-1 hover:bg-slate-200 dark:hover:bg-slate-600 rounded"
                  >
                    <X className="w-4 h-4 text-slate-400" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* File Conversion State */}
      {isConvertingFiles && (
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 text-center">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-3" />
          <p className="text-sm font-medium text-slate-900 dark:text-white mb-1">
            Converting files...
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {conversionProgress.current} of {conversionProgress.total} files converted
          </p>
        </div>
      )}

      {/* Processing State */}
      {(isProcessing || isLoadingMock) && (
        <div className="bg-primary-50 dark:bg-primary-900/20 rounded-xl p-6 text-center">
          <Loader2 className="w-8 h-8 text-primary-500 animate-spin mx-auto mb-3" />
          <p className="text-sm font-medium text-slate-900 dark:text-white mb-1">
            {isLoadingMock ? 'Processing Mock Candidates with Gemini AI...' : 'Processing with Gemini AI...'}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {progress.current} of {progress.total} candidates analyzed
          </p>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">
            This may take a moment for large batches...
          </p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-danger/10 border border-danger/20 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-danger flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-danger mb-1">Error</p>
              <p className="text-sm text-danger/80">{error}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
