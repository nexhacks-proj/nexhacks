'use client'

import { useState } from 'react'
import { Upload, FileText, X, Loader2, CheckCircle, AlertCircle } from 'lucide-react'
import { Job, Candidate } from '@/types'
import { useStore } from '@/store/useStore'
import { extractTextFromFile, validateFileType } from '@/lib/fileConverter'
import { addToMockResumes } from '@/data/mockCandidates'

interface ResumeFile {
  id: string
  name: string
  email: string
  rawResume: string
}

interface ResumeUploaderProps {
  job: Job
  onComplete: (candidateIds: string[]) => void
}

export default function ResumeUploader({ job, onComplete }: ResumeUploaderProps) {
  const { addCandidate } = useStore()
  const [resumes, setResumes] = useState<ResumeFile[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState({ current: 0, total: 0 })
  const [error, setError] = useState<string | null>(null)

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    setError(null)
    const newResumes: ResumeFile[] = []

    for (let i = 0; i < files.length; i++) {
      const file = files[i]

      // Validate file type
      const validation = validateFileType(file)
      if (!validation.valid) {
        setError(validation.error || 'Invalid file type')
        continue
      }

      try {
        const text = await extractTextFromFile(file)

        // Try to extract email from resume text
        const emailMatch = text.match(/[\w.-]+@[\w.-]+\.\w+/)
        const email = emailMatch ? emailMatch[0] : `candidate${Date.now()}@example.com`

        const newResume = {
          id: `upload-${Date.now()}-${i}`,
          name: file.name.replace(/\.[^/.]+$/, ''),
          email,
          rawResume: text
        }

        newResumes.push(newResume)

        // Add to mock resumes pool
        addToMockResumes(newResume)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to read file')
      }
    }

    // Auto-process uploaded resumes
    if (newResumes.length > 0) {
      await processResumesImmediately(newResumes)
    }
  }

  const handlePaste = async (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const text = e.clipboardData.getData('text')
    if (text.trim()) {
      const emailMatch = text.match(/[\w.-]+@[\w.-]+\.\w+/)
      const email = emailMatch ? emailMatch[0] : `candidate${Date.now()}@example.com`

      const newResume = {
        id: `paste-${Date.now()}`,
        name: `Candidate ${Date.now()}`,
        email,
        rawResume: text
      }

      // Add to mock resumes pool
      addToMockResumes(newResume)

      // Auto-process pasted resume
      await processResumesImmediately([newResume])
    }
  }

  const removeResume = (id: string) => {
    setResumes(resumes.filter(r => r.id !== id))
  }

  const processResumesImmediately = async (resumesToProcess: ResumeFile[]) => {
    setIsProcessing(true)
    setError(null)
    setProgress({ current: 0, total: resumesToProcess.length })

    for (let i = 0; i < resumesToProcess.length; i++) {
      const resume = resumesToProcess[i]
      try {
        const response = await fetch('/api/candidates/parse', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            rawResume: resume.rawResume,
            name: resume.name,
            email: resume.email,
            job
          })
        })

        if (!response.ok) {
          throw new Error('Failed to parse resume')
        }

        const data = await response.json()

        // Add the parsed candidate to the store
        const parsedCandidate: Candidate = {
          ...data.candidate,
          id: resume.id,
          jobId: job.id,
          status: 'pending' as const
        }

        addCandidate(parsedCandidate)
        setProgress({ current: i + 1, total: resumesToProcess.length })
      } catch (err) {
        console.error('Error processing resume:', err)
        setError(`Failed to process ${resume.name}`)
      }
    }

    setIsProcessing(false)
  }

  const processResumes = async () => {
    if (resumes.length === 0) return

    setIsProcessing(true)
    setError(null)
    setProgress({ current: 0, total: resumes.length })

    const processedIds: string[] = []

    for (let i = 0; i < resumes.length; i++) {
      const resume = resumes[i]
      try {
        const response = await fetch('/api/candidates/parse', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            rawResume: resume.rawResume,
            name: resume.name,
            email: resume.email,
            job
          })
        })

        if (!response.ok) {
          throw new Error('Failed to parse resume')
        }

        const data = await response.json()

        // Add the parsed candidate to the store
        const parsedCandidate: Candidate = {
          ...data.candidate,
          id: resume.id,
          jobId: job.id,
          status: 'pending' as const
        }

        addCandidate(parsedCandidate)
        processedIds.push(resume.id)
        setProgress({ current: i + 1, total: resumes.length })
      } catch (err) {
        console.error('Error processing resume:', err)
        setError(`Failed to process ${resume.name}`)
      }
    }

    setIsProcessing(false)

    if (processedIds.length > 0) {
      onComplete(processedIds)
      setResumes([])
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
          Supports PDF, Word (.docx), and text files • Max 10MB
        </p>

        <div className="space-y-3">
          <label className="inline-block">
            <input
              type="file"
              multiple
              accept=".txt,.pdf,.docx,.doc,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              onChange={handleFileUpload}
              className="hidden"
              disabled={isProcessing}
            />
            <span className={`px-6 py-3 bg-primary-500 hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl cursor-pointer inline-block transition-colors text-base font-medium ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}>
              {isProcessing ? 'Processing...' : 'Upload Resumes'}
            </span>
          </label>

          <div className="text-sm text-slate-400">or</div>

          <textarea
            placeholder="Paste resume text here (auto-processes on paste)..."
            onPaste={handlePaste}
            disabled={isProcessing}
            className="w-full px-4 py-3 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent min-h-[100px] disabled:opacity-50 disabled:cursor-not-allowed"
          />
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

      {/* Processing State */}
      {isProcessing && (
        <div className="bg-primary-50 dark:bg-primary-900/20 rounded-xl p-6 text-center">
          <Loader2 className="w-8 h-8 text-primary-500 animate-spin mx-auto mb-3" />
          <p className="text-sm font-medium text-slate-900 dark:text-white mb-1">
            Processing with Gemini AI...
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {progress.current} of {progress.total} candidates analyzed
          </p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-danger/10 border border-danger/20 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-danger flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-danger mb-1">Upload Error</p>
              <p className="text-sm text-danger/80">{error}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                Tip: Supported formats are PDF, Word (.docx), and plain text (.txt)
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
